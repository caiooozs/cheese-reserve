"use client";

import { FormularioLoginView } from "@/components/formulario-login/formulario-login.view";
import { useFormularioLoginViewModel } from "@/components/formulario-login/formulario-login.viewmodel";

export function FormularioLogin() {
  const { dados, campos, acoes } = useFormularioLoginViewModel();
  return <FormularioLoginView dados={dados} campos={campos} acoes={acoes} />;
}
