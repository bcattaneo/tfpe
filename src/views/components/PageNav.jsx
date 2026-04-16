export default function PageNav({ currentPage, numPages, onPageChange }) {
  return (
    <nav className="page-nav">
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        title="Previous page"
      >
        &#8592;
      </button>
      <span>Page {currentPage + 1} of {numPages}</span>
      <button
        disabled={currentPage === numPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        title="Next page"
      >
        &#8594;
      </button>
    </nav>
  )
}
