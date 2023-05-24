import { makeStyles } from '@mui/styles';

export default makeStyles((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  containerMap: {
    flexBasis: '40%',
    flexShrink: 0,
  },
  containerMain: {
    overflow: 'auto',
  },
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  columnAction: {
    width: '1%',
    paddingLeft: theme.spacing(1),
  },
  filter: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2),
  },
  filterItem: {
    minWidth: 0,
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButton: {
    flexGrow: 1,
  },
  chart: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  // buttonsPagination: {
  //   marginTop: 5,
  // },
  // buttonPage: {
  //   padding: 10,
  //   font: 1,
  //   background: '#F4F6F7',
  //   bgcolor: 'background.paper',
  //   m: 1,
  //   borderColor: 'text.primary',
  //   width: '2.3rem',
  //   height: '2.3rem',
  // },
  buttonsPagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPage: {
    margin: '5px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    width: '2.3rem',
    height: '2.3rem',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: 'lightgray',
    },
    alignItems: 'center',
  },
  buttonPageMove: {
    margin: '5px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    width: '2.3rem',
    height: '2.3rem',
    backgroundColor: 'gray',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: 'lightgray',
    },
    alignItems: 'center',
  },
  textPages: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: '5px',
    padding: '10px',
  },
}));
