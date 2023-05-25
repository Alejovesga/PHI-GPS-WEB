import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Table, TableRow, TableCell, TableHead, TableBody, IconButton,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import TableShimmer from '../common/components/TableShimmer';
import RemoveDialog from '../common/components/RemoveDialog';
import Pagination from './components/Pagination';

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
  buttonsPagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const ScheduledPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const calendars = useSelector((state) => state.calendars.items);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState();

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const formatType = (type) => {
    switch (type) {
      case 'events':
        return t('reportEvents');
      case 'route':
        return t('reportRoute');
      case 'summary':
        return t('reportSummary');
      case 'trips':
        return t('reportTrips');
      case 'stops':
        return t('reportStops');
      default:
        return type;
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSection, setCurrentPageSection] = useState(1);
  useEffect(() => {
    function handlepage() {
      setCurrentPage(1);
    }
    handlepage();
    function handleRangePage() {
      setCurrentPageSection(1);
    }
    handleRangePage();
  }, [items]);
  // Calcula el índice del primer y último registro en cada página
  const indexOfLast = currentPage * 200;
  const indexOfFirst = indexOfLast - 200;
  // Calcula el número total de páginas
  const totalPages = Math.ceil(items.length / 200);
  // Cambia a la página seleccionada
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // cantidad de pagina en seccion
  let pagesSection = [...Array(totalPages).keys()].map((num) => num + 1);
  const indexLastSection = currentPageSection * 10;
  const indexFirstSection = indexLastSection - 10;
  pagesSection = pagesSection.slice(indexFirstSection, indexLastSection);

  const onPageSectionChange = (pageNumber) => {
    setCurrentPageSection(pageNumber);
  };
  const onPageSectionChangeBefore = (pageNumber) => {
    setCurrentPageSection(pageNumber);
  };
  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['settingsTitle', 'reportScheduled']}>
      <div className={classes.containerMain}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedType')}</TableCell>
              <TableCell>{t('sharedDescription')}</TableCell>
              <TableCell>{t('sharedCalendar')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? items.slice(indexOfFirst, indexOfLast).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatType(item.type)}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{calendars[item.calendarId].name}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <IconButton size="small" onClick={() => setRemovingId(item.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={4} endAction />)}
          </TableBody>
        </Table>
        <RemoveDialog
          style={{ transform: 'none' }}
          open={!!removingId}
          endpoint="reports"
          itemId={removingId}
          onResult={(removed) => {
            setRemovingId(null);
            if (removed) {
              setTimestamp(Date.now());
            }
          }}
        />
      </div>
      <div className={classes.buttonsPagination}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pagesSection={pagesSection}
          onPageChange={onPageChange}
          onPageSectionChange={onPageSectionChange}
          currentPageSection={currentPageSection}
          onPageSectionChangeBefore={onPageSectionChangeBefore}
        />
      </div>
    </PageLayout>
  );
};

export default ScheduledPage;
