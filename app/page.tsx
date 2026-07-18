import { MatrixRain } from "./MatrixRain";

export default function Home() {
  return (
    <main className="matrix-page">
      <MatrixRain />
      <div className="matrix-atmosphere" aria-hidden="true" />

      <section className="matrix-copy" aria-labelledby="intro-title">
        <h1 id="intro-title">¿Hola amigo?</h1>
        <p>byJim</p>
      </section>

      <div className="matrix-horizon" aria-hidden="true" />
    </main>
  );
}
