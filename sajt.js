
document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([44.8176, 20.4633], 12); // Početna tačka je Beograd

    // Učitaj tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Učitaj sačuvana mesta iz localStorage
    let savedPlaces = JSON.parse(localStorage.getItem("savedPlaces")) || [];

    // Funkcija za prikaz sačuvanih mesta
    const renderPlaces = () => {
        savedPlaces.forEach((place) => {
            const marker = L.marker([place.lat, place.lng]).addTo(map);
            marker.bindPopup(`
                <div>
                    <strong>${place.name}</strong><br>
                    <button class="delete-btn" data-lat="${place.lat}" data-lng="${place.lng}">x</button>
                </div>
            `);

            // Brisanje mesta kad se klikne na "x"
            marker.on('popupopen', function () {
                const deleteButton = document.querySelector('.delete-btn');
                const closeButton = document.querySelector('.leaflet-popup-close-button');

                // Sakrij podrazumevani "x" dugme
                if (closeButton) {
                    closeButton.style.display = 'none';
                }

                // Brisanje marker-a kad se klikne na "x" dugme u popupu
                if (deleteButton) {
                    deleteButton.addEventListener('click', function () {
                        // Ukloni marker sa mape
                        map.removeLayer(marker);

                        // Ukloni mesto iz savedPlaces i localStorage
                        savedPlaces = savedPlaces.filter((savedPlace) => savedPlace.lat !== place.lat || savedPlace.lng !== place.lng);
                        localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
                    });
                }
            });
        });
    };

    // Funkcija za dodavanje novih mesta
    const addPlace = (lat, lng, name) => {
        const place = { lat, lng, name };
        savedPlaces.push(place);
        localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));

        // Dodaj marker na mapu
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
            <div>
                <strong>${name}</strong><br>
                <button class="delete-btn" data-lat="${lat}" data-lng="${lng}">x</button>
            </div>
        `);

        // Brisanje mesta kad se klikne na "x"
        marker.on('popupopen', function () {
            const deleteButton = document.querySelector('.delete-btn');
            const closeButton = document.querySelector('.leaflet-popup-close-button');

            // Sakrij podrazumevani "x" dugme
            if (closeButton) {
                closeButton.style.display = 'none';
            }

            // Brisanje marker-a kad se klikne na "x" dugme u popupu
            if (deleteButton) {
                deleteButton.addEventListener('click', function () {
                    // Ukloni marker sa mape
                    map.removeLayer(marker);

                    // Ukloni mesto iz savedPlaces i localStorage
                    savedPlaces = savedPlaces.filter((savedPlace) => savedPlace.lat !== lat || savedPlace.lng !== lng);
                    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
                });
            }
        });
    };

    // Dodaj marker kad se klikne na mapu
    map.on('click', function (e) {
        const name = prompt("Unesi naziv mesta:");
        if (name) {
            addPlace(e.latlng.lat, e.latlng.lng, name);
        }
    });

    // Prikazivanje sačuvanih mesta na mapi
    renderPlaces();
});

document.addEventListener("DOMContentLoaded", function () {
    const calendarBody = document.getElementById('calendarBody');
    const monthYear = document.getElementById('monthYear');
    const noteInput = document.getElementById('noteInput');
    const saveNoteButton = document.getElementById('saveNote');
    const deleteNoteButton = document.getElementById('deleteNote');
    const prevYearButton = document.getElementById('prevYear');
    const nextYearButton = document.getElementById('nextYear');
    const prevMonthButton = document.getElementById('prevMonth');  // Dugme za prethodni mesec
    const nextMonthButton = document.getElementById('nextMonth');  // Dugme za sledeći mesec

    let selectedDate = null;
    let notes = JSON.parse(localStorage.getItem('notes')) || {};  // Učitava beleške iz localStorage
    let currentDate = new Date();  // Trenutni datum

 // Funkcija za prikazivanje kalendara
function renderCalendar(year, month) {
    const firstDay = new Date(year, month).getDay();  // Prvi dan u mesecu
    const daysInMonth = new Date(year, month + 1, 0).getDate();  // Broj dana u mesecu
  
    calendarBody.innerHTML = '';  // Briše prethodni sadržaj kalendara
    monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;  // Ime meseca i godina
  
    let date = 1;
    for (let i = 0; i < 6; i++) {  // Kreiranje redova u kalendaru
      const row = document.createElement('tr');
  
      for (let j = 0; j < 7; j++) {  // Kreiranje ćelija za dane u mesecu
        const cell = document.createElement('td');
        const cellText = document.createTextNode('');
  
        if (i === 0 && j < firstDay) {  // Ako je ćelija pre prvog dana meseca
          cell.appendChild(cellText);
        } else if (date > daysInMonth) {  // Ako su dani u mesecu završeni
          break;
        } else {
          cell.textContent = date;  // Dodaje datum u ćeliju
          cell.classList.add('date-cell');
  
          if (
            currentDate.getFullYear() === year &&
            currentDate.getMonth() === month &&
            currentDate.getDate() === date
          ) {
            cell.classList.add('current-date');  // Obeležava trenutni datum
          }
  
          const noteKey = `${year}-${month + 1}-${date}`;  // Ključ za belešku
          if (notes[noteKey]) {  // Ako postoji beleška za datum
            cell.classList.add('noted-date');
          }
  
          // Dodavanje event listenera za selektovanje datuma
          cell.addEventListener('click', () => {
            // Ako postoji prethodni selektovani datum, ukloni njegovu klasu
            if (selectedDate) {
              const prevSelectedCell = document.querySelector(`td[data-note-key="${selectedDate}"]`);
              if (prevSelectedCell) {
                prevSelectedCell.classList.remove('selected-date');
              }
            }
  
            // Selektuj novi datum
            selectedDate = noteKey;
            noteInput.value = notes[noteKey] || '';  // Prikazuje belešku za odabrani datum
            cell.classList.add('selected-date');  // Dodaj selektovanu boju za datum
            cell.setAttribute('data-note-key', selectedDate);  // Dodaj atribut sa ključem za datum
          });
  
          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }
  }
  

    // Funkcija za čuvanje beleške
    function saveNote() {
        if (selectedDate) {
            const note = noteInput.value.trim();
            if (note) {
                notes[selectedDate] = note;  // Čuva belešku
            } else {
                delete notes[selectedDate];  // Briše belešku ako je unos prazan
            }
            localStorage.setItem('notes', JSON.stringify(notes));  // Spremanje beleški u localStorage
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());  // Ponovno renderuje kalendar
        }
    }

    // Funkcija za brisanje beleške
    function deleteNote() {
        if (selectedDate && notes[selectedDate]) {
            delete notes[selectedDate];  // Briše belešku za izabrani datum
            localStorage.setItem('notes', JSON.stringify(notes));  // Spremanje izmena u localStorage
            noteInput.value = '';  // Briše sadržaj u input polju
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());  // Ponovno renderuje kalendar
        }
    }

    // Navigacija kroz godine
    prevYearButton.addEventListener('click', () => {  // Dugme za prethodnu godinu
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextYearButton.addEventListener('click', () => {  // Dugme za sledeću godinu
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Navigacija kroz mesece
    prevMonthButton.addEventListener('click', () => {  // Dugme za prethodni mesec
        if (currentDate.getMonth() === 0) {  // Ako je januar, vratimo se na decembar prethodne godine
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            currentDate.setMonth(11); // Decembar
        } else {
            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthButton.addEventListener('click', () => {  // Dugme za sledeći mesec
        if (currentDate.getMonth() === 11) {  // Ako je decembar, idemo na januar sledeće godine
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            currentDate.setMonth(0); // Januar
        } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    // Spremanje beleške
    saveNoteButton.addEventListener('click', saveNote);

    // Brisanje beleške
    deleteNoteButton.addEventListener('click', deleteNote);

    // Početno prikazivanje kalendara
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
});

// Get the note content from localStorage when the page loads
window.onload = function() {
    const noteContent = localStorage.getItem('stickyNote');
    const textarea = document.getElementById('note-content');
    
    if (noteContent) {
        textarea.value = noteContent;
    }

    // Save the note content to localStorage whenever it changes
    textarea.addEventListener('input', function() {
        localStorage.setItem('stickyNote', textarea.value);
    });
};
