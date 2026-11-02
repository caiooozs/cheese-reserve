import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão e manda para o login quem não tem sessão.
// Quem é admin é decidido na página, nas actions e, por último, no banco.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaGravar, headers) {
          cookiesParaGravar.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesParaGravar.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([nome, valor]) =>
            response.headers.set(nome, valor),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && request.nextUrl.pathname !== "/admin/login") {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    const redirecionamento = NextResponse.redirect(login);
    response.cookies
      .getAll()
      .forEach((cookie) => redirecionamento.cookies.set(cookie));
    return redirecionamento;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
