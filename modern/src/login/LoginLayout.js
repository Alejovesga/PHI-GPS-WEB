import React from 'react';
import { useMediaQuery, Paper } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    alignItems: 'center', // Centra verticalmente el contenido del contenedor
    justifyContent: 'center',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    boxShadow: '-2px 0px 16px rgba(0, 0, 0, 0.25)',
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: '100%', // Ocupa todo el ancho del contenedor
  },
  form: {
    width: '100%', // Ocupa todo el ancho del formulario
  },
  logo: {
    padding: theme.spacing(2),
  },
}));

const LoginLayout = ({ children }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <Paper className={classes.paper}>
        <div className={classes.logo}>
          {!useMediaQuery(theme.breakpoints.down('lg')) && <LogoImage color={theme.palette.secondary.contrastText} />}
        </div>
        <form className={classes.form}>
          {children}
        </form>
      </Paper>
    </main>
  );
};

export default LoginLayout;
