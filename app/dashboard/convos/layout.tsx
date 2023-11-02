export default async function Messages({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col gap-4 p-16 xl:p-48">{children}</div>;
}
