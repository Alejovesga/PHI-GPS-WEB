import React, { useState, useEffect } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import Pagination from '../reports/components/Pagination';

const useStyles = makeStyles((theme) => ({
  containerMain: {
    overflow: 'auto',
  },
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

const DriversPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/drivers');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);
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
  const filteredItems = items.filter(filterByKeyword(searchKeyword));
  const indexOfLast = currentPage * 50;
  const indexOfFirst = indexOfLast - 50;
  const totalPages = Math.ceil(filteredItems.length / 50);
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedDrivers']}>
      <div className={classes.containerMain}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedName')}</TableCell>
              <TableCell>{t('deviceIdentifier')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? (() => {
              const NewItems = filteredItems.length >= (indexOfLast - indexOfFirst) ? filteredItems.slice(indexOfFirst, indexOfLast) : filteredItems;
              return NewItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.uniqueId}</TableCell>
                  <TableCell className={classes.columnAction} padding="none">
                    <CollectionActions itemId={item.id} editPath="/settings/driver" endpoint="drivers" setTimestamp={setTimestamp} />
                  </TableCell>
                </TableRow>
              ));
            })() : (<TableShimmer columns={3} endAction />)}
          </TableBody>
        </Table>
        <CollectionFab editPath="/settings/driver" />
      </div>
      <div className={classes.buttonsPagination}>
        {items.filter(filterByKeyword(searchKeyword)).length >= (indexOfLast - indexOfFirst) && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pagesSection={pagesSection}
          onPageChange={onPageChange}
          onPageSectionChange={onPageSectionChange}
          currentPageSection={currentPageSection}
          onPageSectionChangeBefore={onPageSectionChangeBefore}
        />
        )}
      </div>
    </PageLayout>
  );
};

export default DriversPage;
