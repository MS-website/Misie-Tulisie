export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <title>Strona nie załadowała się</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #faf8f4; color: #3a342c; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.5rem; font-weight: 400; margin: 0 0 0.5rem; }
      p { color: #6b645b; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #3a342c; color: #fff; }
      .secondary { background: #fff; color: #3a342c; border-color: #d9d2c8; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Strona nie załadowała się</h1>
      <p>Spróbuj odświeżyć stronę albo wróć na stronę główną.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Spróbuj ponownie</button>
        <a class="secondary" href="/">Strona główna</a>
      </div>
    </div>
  </body>
</html>`;
}
