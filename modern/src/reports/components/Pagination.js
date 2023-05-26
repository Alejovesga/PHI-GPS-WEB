import React from 'react';
import useReportStyles from '../common/useReportStyles';

const Pagination = ({ currentPage, onPageChange, pagesSection, totalPages, onPageSectionChange, currentPageSection, onPageSectionChangeBefore }) => {
  const classes = useReportStyles();
  // Genera un arreglo de números desde 1 hasta el número total de páginas
  // const pageNumbers = [...Array(totalPages).keys()].map((num) => num + 1);
  // const pageNumbersSection = [...Array(pagesSection).keys()].map((num) => num + 1);
  return (
    <div>
      <p
        className={classes.textPages}
        hidden={pagesSection.length === 0}
      >
        Pagina
        &nbsp;
        {currentPage}
        &nbsp;
        de
        &nbsp;
        { totalPages}
      </p>
      <button
        className={classes.buttonPageMove}
        onClick={() => onPageSectionChangeBefore(currentPageSection - 1)}
        type="button"
        hidden={pagesSection <= 1 || pagesSection[0] === 1}
      >
        &larr;
      </button>
      {pagesSection.map((pageNumber) => (
        <button
          className={classes.buttonPage}
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          disabled={pageNumber === currentPage}
          type="button"
        >
          {pageNumber}
        </button>
      ))}
      <button
        className={classes.buttonPageMove}
        onClick={() => onPageSectionChange(currentPageSection + 1)}
        type="button"
        hidden={pagesSection <= 1 || pagesSection.includes(totalPages)}
      >
        &rarr;
      </button>
    </div>
  );
};
export default Pagination;
