import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const previewRoot = new URL("../app/_sites-preview/", import.meta.url);

async function render(url = "https://byjim.dev/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const requestUrl = new URL(url);

  return worker.fetch(
    new Request(requestUrl, {
      headers: {
        accept: "text/html",
        "x-forwarded-host": requestUrl.host,
        "x-forwarded-proto": requestUrl.protocol.slice(0, -1),
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the byJim Matrix landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="es"/i);
  assert.match(html, /<title>¿Hola amigo\? — byJim\.dev<\/title>/i);
  assert.match(html, /<h1[^>]*>¿Hola amigo\?<\/h1>/i);
  assert.match(html, /<p>byJim<\/p>/i);
  assert.match(html, /<canvas[^>]*aria-hidden="true"/i);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/byjim\.dev\/"\/>/i,
  );
  assert.match(
    html,
    /<meta property="og:title" content="¿Hola amigo\? — byJim\.dev"\/>/i,
  );
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/byjim\.dev\/og\.png"\/>/i,
  );
  assert.match(
    html,
    /<meta property="og:image:width" content="1200"\/>/i,
  );
  assert.match(
    html,
    /<meta property="og:image:height" content="630"\/>/i,
  );
  assert.match(
    html,
    /<meta name="twitter:card" content="summary_large_image"\/>/i,
  );
  assert.match(
    html,
    /<meta name="twitter:image" content="https:\/\/byjim\.dev\/og\.png"\/>/i,
  );
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("uses the incoming host for the absolute social image URL", async () => {
  const response = await render("https://preview.byjim.dev/");
  const html = await response.text();

  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/preview\.byjim\.dev\/og\.png"\/>/i,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/byjim\.dev\/"\/>/i,
  );
});

test("keeps the animation accessible and removes the starter", async () => {
  const [rain, css, page, layout, packageJson, socialImage] = await Promise.all([
    readFile(new URL("../app/MatrixRain.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.match(rain, /prefers-reduced-motion: reduce/);
  assert.match(rain, /cancelAnimationFrame/);
  assert.match(rain, /removeEventListener/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(page, /<MatrixRain \/>/);
  assert.match(layout, /lang="es"/);
  assert.deepEqual(
    [...socialImage.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
  assert.equal(socialImage.readUInt32BE(16), 1200);
  assert.equal(socialImage.readUInt32BE(20), 630);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(previewRoot));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
