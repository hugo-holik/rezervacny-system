import { Card, Container, Grid, Paper, Typography } from '@mui/material';

const Info = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Informácie o projekte
      </Typography>

      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Prehľad
        </Typography>
        <Typography variant="body1" paragraph>
          Vitajte v projekte! Táto aplikácia slúži na správu používateľov a poskytuje používateľsky
          prívetivé rozhranie pre administrátorov na správu účtov, zobrazenie informácií a bezpečné
          aktualizovanie údajov používateľov. Okrem toho aplikácia umožňuje efektívnu správu
          externých škôl, udalostí, cvičení a prihlášok, ako aj sledovanie histórie prihlásení a
          schválení.
        </Typography>

        <Typography variant="h6" gutterBottom>
          Kľúčové vlastnosti
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Správa používateľov
              </Typography>
              <Typography variant="body2">
                Umožňuje administrátorom spravovať informácie o používateľoch, ako sú meno, email,
                rola a heslo. Pomáha udržiavať aktualizované účty používateľov v systéme.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Správa externých škôl
              </Typography>
              <Typography variant="body2">
                Spravuje externé školy, ktoré sú priradené externým učiteľom. Umožňuje
                administrátorom priraďovať školy k externým učiteľom a spravovať tieto informácie.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Správa udalostí
              </Typography>
              <Typography variant="body2">
                Umožňuje administrátorom vytvárať a spravovať udalosti, ako sú špeciálne cvičenia, s
                definovaním termínov a prístupovými právami pre prihlásenie účastníkov.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Správa cvičení
              </Typography>
              <Typography variant="body2">
                Spravuje špecifické cvičenia, ktoré sú priradené zamestnancom a externým učiteľom.
                Umožňuje nastavenie času, kapacity a popisu cvičení.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Správa prihlášok
              </Typography>
              <Typography variant="body2">
                Umožňuje spravovať prihlášky používateľov na cvičenia, sledovať stav schválenia a
                schvaľovať prihlášky externých učiteľov na cvičenia.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                História prihlásení
              </Typography>
              <Typography variant="body2">
                Umožňuje administrátorom a učiteľom sledovať históriu prihlásení na cvičenia, ako aj
                schválenie prihlášok a ďalšie záznamy o aktivitách používateľov.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Použité technológie
        </Typography>
        <Typography variant="body1" paragraph>
          Tento projekt je postavený na nasledujúcich technológiách:
        </Typography>
        <ul>
          <li>React (Frontend)</li>
          <li>Node.js (Backend)</li>
          <li>MongoDB (Databáza)</li>
          <li>Material UI (UI komponenty)</li>
          <li>JWT autentifikácia</li>
        </ul>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Nastavenie projektu
        </Typography>
        <Typography variant="body1" paragraph>
          Ak chcete spustiť tento projekt lokálne, postupujte podľa týchto krokov:
        </Typography>
        <ol>
          <li>
            Skopírujte repozitár:{' '}
            <code>git clone https://github.com/hugo-holik/rezervacny-system</code>
          </li>
          <li>
            Nainštalujte závislosti: <code>npm install</code>
          </li>
          <li>Nastavte environment variables pre backend a frontend (napr. JWT_SECRET, DB_URI)</li>
          <li>
            Spustite vývojový server: <code>npm run dev</code>
          </li>
        </ol>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Rezervačný systém FEIT
        </Typography>
        <Typography variant="body1" paragraph>
          Tento systém nahradí existujúce rozšírenie do WordPressu pre správu špeciálnych cvičení.
        </Typography>
        <Typography variant="body1" paragraph>
          Všeobecná funkcionalita systému:
        </Typography>
        <ul>
          <li>Zamestnanci školy – spravovanie špeciálnych cvičení</li>
          <li>Externí učitelia – prihlasovanie sa na povolené cvičenia</li>
        </ul>
      </Card>
    </Container>
  );
};

export default Info;
