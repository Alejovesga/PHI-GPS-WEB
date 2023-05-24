import React from 'react';
import useReportStyles from '../common/useReportStyles';

const Pagination = ({ currentPage, onPageChange, pagesSection, totalPages, onPageSectionChange, currentPageSection }) => {
  const classes = useReportStyles();
  // Genera un arreglo de números desde 1 hasta el número total de páginas
  // const pageNumbers = [...Array(totalPages).keys()].map((num) => num + 1);
  // const pageNumbersSection = [...Array(pagesSection).keys()].map((num) => num + 1);

  return (
    <div>
      <h3>
        {totalPages}
        paginas
      </h3>
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
        className={classes.buttonPage}
        onClick={() => onPageSectionChange(currentPageSection + 1)}
        type="button"
        hidden={pagesSection <= 1 || pagesSection[3] === (totalPages)}
      >
        N
      </button>
    </div>
  );
};
export default Pagination;
