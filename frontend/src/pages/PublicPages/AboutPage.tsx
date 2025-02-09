import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import "../../styles/PublicStyles/AboutPage.css";
function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: 4 }}>
      {/* Main Heading Section */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        About Us
      </Typography>

      {/* Introductory Section */}
      <Typography
        variant="body1"
        gutterBottom
        sx={{ textAlign: "center", marginBottom: 3 }}
      >
        Welcome to our cutting-edge options trading platform! We're dedicated to
        providing reliable, fast, and intuitive tools to help traders succeed in
        the dynamic world of financial markets.
      </Typography>

      {/* Mission and Vision Section */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1">
              To empower traders with advanced analytics, real-time market
              insights, and a seamless trading experience.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Our Vision
            </Typography>
            <Typography variant="body1">
              To be the most trusted platform for options trading by delivering
              innovation, transparency, and exceptional support.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Features Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold" }}
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Advanced Tools
              </Typography>
              <Typography variant="body1">
                Gain access to cutting-edge analytics and customizable profit
                calculators tailored to your trading strategy.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Real-Time Insights
              </Typography>
              <Typography variant="body1">
                Stay ahead with instant updates on market trends and
                opportunities.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Community Support
              </Typography>
              <Typography variant="body1">
                Join a thriving community of traders and leverage shared
                knowledge to make smarter decisions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Closing Section */}
      <Box sx={{ textAlign: "center", marginTop: 4 }}>
        <Typography variant="h6">
          Ready to elevate your trading experience? Join us today and start
          making confident trading decisions!
        </Typography>
      </Box>
    </Container>
  );
}

export default AboutPage;
