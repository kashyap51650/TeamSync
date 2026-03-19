export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Select a workspace from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
