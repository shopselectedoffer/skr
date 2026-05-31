Ja — Klara har rätt här. Gör exakt den lösningen. Den är mycket säkrare än att trycka in HTML i page.tsx.

Du ska alltså ha:

public/offertsnurra-pro.html

= hela långa HTML-koden som börjar med:

<!DOCTYPE html>
<html lang="sv">

Och:

app/pro/page.tsx

= bara den lilla iframe-koden:

export default function ProPage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", margin: 0, padding: 0 }}>
      <iframe
        src="/offertsnurra-pro.html"
        title="Stensjö Vård AB — Master Offertsnurra Pro"
        style={{
          width: "100%",
          minHeight: "100vh",
          border: "none",
          display: "block",
        }}
      />
    </main>
  );
}
Viktigt när du gör det i GitHub

Gör i denna ordning:

Skapa filen:

public/offertsnurra-pro.html
Klistra in hela HTML-koden där.
Klicka Commit changes.

Öppna:

app/pro/page.tsx
Radera allt.
Klistra in iframe-koden ovan.
Klicka Commit changes.
Gå till Vercel och vänta på ny deployment.
Om det blir fel ändå

Då är det nästan garanterat något av detta:

- filen hamnade inte i public/
- filnamnet blev felstavat
- page.tsx pekar på fel src
- du committade bara ena filen

Exakt filnamn måste matcha:

src="/offertsnurra-pro.html"

och filen måste heta exakt:

offertsnurra-pro.html

Det här är rätt väg nu.
