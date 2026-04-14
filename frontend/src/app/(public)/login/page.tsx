import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readError(searchParams: Record<string, string | string[] | undefined> | undefined) {
  const value = searchParams?.error;
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = readError(resolvedSearchParams);

  redirect(error ? `/?error=${encodeURIComponent(error)}` : "/");
}
