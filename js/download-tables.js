// download-tables.js
// Χειρίζεται τα "Download as…" dropdowns για όλους τους πίνακες

(function () {

  function exportTable(sectionId, format) {
    const section = document.getElementById(sectionId);
    if (!section) {
      alert('Table section not found: ' + sectionId);
      return;
    }

    const table = section.querySelector('table');
    if (!table) {
      alert('Table not found in section: ' + sectionId);
      return;
    }

    const rows = [];
    table.querySelectorAll('tr').forEach(row => {
      const cells = Array.from(row.children).map(td =>
        td.innerText.replace(/\r?\n/g, ' ').trim()
      );
      if (cells.length) rows.push(cells);
    });

    let blob;
    if (format === 'csv') {
      const csv = rows
        .map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(','))
        .join('\n');
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    } else if (format === 'txt') {
      const txt = rows.map(r => r.join('\t')).join('\n');
      blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    } else if (format === 'json') {
      blob = new Blob(
        [JSON.stringify(rows, null, 2)],
        { type: 'application/json;charset=utf-8;' }
      );
    } else {
      return;
    }

    const filename = `${sectionId}.${format}`;

    // Προτίμηση σε FileSaver.js αν υπάρχει
    if (typeof saveAs === 'function') {
      saveAs(blob, filename);
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function initDownloadDropdowns() {
    document.querySelectorAll('.download-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const format = sel.value;
        if (!format) return;

        const sectionId = sel.dataset.table; // π.χ. "sanSection"
        if (!sectionId) return;

        exportTable(sectionId, format);
        sel.value = ''; // reset επιλογής
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDownloadDropdowns);
  } else {
    initDownloadDropdowns();
  }

})();
