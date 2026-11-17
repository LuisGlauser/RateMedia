import { expect, test } from "@playwright/test";

// Rodam em modo demonstração (sem Supabase): valida o que não depende de dados do banco.
test.describe("Home: carrossel e comunidade", () => {
  test("o carrossel 'Em Alta' rola com as setas quando as obras não cabem na tela", async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto("/");

    const prev = page.getByRole("button", { name: "Anterior" });
    const next = page.getByRole("button", { name: "Próximo" });
    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();

    await next.click();
    await expect(prev).toBeEnabled(); // saiu do início depois da rolagem suave
  });

  test("em tela larga, com todas as obras visíveis, as duas setas ficam desabilitadas", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Anterior" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Próximo" })).toBeDisabled();
  });

  test("sem avaliações, curadores ou listas mostra estados vazios e os atalhos do feed", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Últimas Avaliações da Comunidade" })).toBeVisible();
    await expect(page.getByText("Ainda não há críticas publicadas.")).toBeVisible();
    await expect(page.getByText("Os curadores aparecem aqui")).toBeVisible();
    await expect(page.getByText("Nenhuma lista pública ainda.")).toBeVisible();

    await expect(page.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/avaliacoes");
    await expect(page.getByRole("link", { name: "Explorar Mais Listas" })).toHaveAttribute("href", "/lista");
  });

  test("o Spotlight de demonstração não oferece avaliar (não há obra no banco)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Cadastre obras para liberar as avaliações.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Adicionar à Lista" })).toHaveAttribute("href", "/busca");
  });
});

test.describe("Páginas da comunidade", () => {
  test("/avaliacoes abre dentro do layout do site e mostra o estado vazio", async ({ page }) => {
    await page.goto("/avaliacoes");
    await expect(page.getByRole("heading", { name: "Avaliações da Comunidade" })).toBeVisible();
    await expect(page.getByText("Nenhuma crítica por aqui ainda.")).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Entrar" })).toBeVisible();
  });

  test("/lista abre dentro do layout do site e mostra o estado vazio", async ({ page }) => {
    await page.goto("/lista");
    await expect(page.getByRole("heading", { name: "Listas em Destaque" })).toBeVisible();
    await expect(page.getByText("Nenhuma lista pública ainda.")).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Entrar" })).toBeVisible();
  });

  test("rotas de crítica e lista com identificador inválido respondem 404", async ({ page }) => {
    for (const path of ["/avaliacoes/foo/bar", "/avaliacoes/media/nao-e-uuid", "/lista/nao-e-uuid"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });
});
