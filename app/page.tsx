import EmailComposer from "@/components/EmailComposer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground font-headline tracking-tight md:text-5xl">
          Email Composer
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Craft and send beautiful emails to your customers with ease.
        </p>
        <div className="mt-8">
          <EmailComposer />
        </div>
      </div>
    </main>
  );
}
