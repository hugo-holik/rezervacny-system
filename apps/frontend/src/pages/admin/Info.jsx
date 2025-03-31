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
          aktualizovanie údajov používateľov.
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
                Umožňuje administrátorom aktualizovať informácie o používateľoch ako meno, email,
                rola a heslo.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Autentifikácia
              </Typography>
              <Typography variant="body2">
                Používatelia sa môžu prihlásiť, odhlásiť a obnoviť svoje heslá. Bezpečná
                autentifikácia je zabezpečená pomocou JWT tokenov.
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
            Skopírujte repozitár: <code>git clone https://github.com/your-repository-url</code>
          </li>
          <li>
            Nainštalujte závislosti: <code>npm install</code>
          </li>
          <li>Nastavte environment variables pre backend a frontend (napr. JWT_SECRET, DB_URI)</li>
          <li>
            Spustite vývojový server: <code>npm run dev</code>
          </li>
        </ol>
      </Card>
    </Container>
  );
};

export default Info;
