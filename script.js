document.addEventListener("DOMContentLoaded", () => {

  const jsonInput = document.getElementById("json-input");

  const trainerNameInput1 = document.getElementById("trainer-name-1");

  const calculateBtn = document.getElementById("calculate-btn"); // Botón para animación normal

  const skipCalculateBtn = document.getElementById("skip-calculate-btn"); // Botón para saltar

  const messageDiv = document.getElementById("message");

  const resultsTableContainer = document.getElementById("results-table-container");

  const totalPointsDiv = document.getElementById("total-points");

  const recordsContainer = document.getElementById("records-container");

  const themeToggleBtn = document.getElementById("theme-toggle");

  const buttonText = document.getElementById("button-text");

  const progressBarFill = document.getElementById("progress-bar-fill");

  

  // Variables de control de animación

  let animationTimeouts = [];

  let isSkipping = false;

  let dataToProcess = []; // Variable global para guardar los datos para la función de salto

  

  // Constantes de la aplicación

  const SEASONS_PER_YEAR = 12;

  const puntos = {

    "HOTEL #1": 8,

    "HOTEL #2": 8,

    "KOK": 4,

    "SAZE": 15,

    "HOTELESS": 10,

    "POKE BALL D'OR": 20,

    "LA LIGA": 40,

    "MUNDIAL": { "1er Lugar": 200, "2do Lugar": 100, "3er Lugar": 50 },

    "WVC": 300

  };

  // --- Funciones de Utilidad ---

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

  }

  themeToggleBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";

    localStorage.setItem("theme", currentTheme);

  });

  const savedJson = localStorage.getItem("trainerSeasonsJson");

  if (savedJson) {

    jsonInput.value = savedJson;

  }

  jsonInput.addEventListener("input", () => {

    localStorage.setItem("trainerSeasonsJson", jsonInput.value);

  });

  function showMessage(text, type) {

    messageDiv.textContent = text;

    messageDiv.className = `message-box ${type}`;

  }

  function clearResults() {

    animationTimeouts.forEach(clearTimeout);

    animationTimeouts = [];

    isSkipping = false;

    messageDiv.className = "message-box";

    messageDiv.innerHTML = "";

    resultsTableContainer.innerHTML = "";

    totalPointsDiv.innerHTML = "";

    recordsContainer.innerHTML = "";

  }

  function setLoadingState(isLoading) {

    if (isLoading) {

      calculateBtn.disabled = true;

      skipCalculateBtn.disabled = true;

      buttonText.style.opacity = "0";

      progressBarFill.style.width = "0";

    } else {

      calculateBtn.disabled = false;

      skipCalculateBtn.disabled = false;

      buttonText.style.opacity = "1";

      progressBarFill.style.width = "0";

    }

  }

  function getValueColorClass(value) {

    if (value >= 20000000) return 'value-golden';

    if (value >= 10000000) return 'value-premium';

    if (value >= 5000000) return 'value-high';

    if (value >= 1000000) return 'value-mid';

    return 'value-low';

  }

  function calculateTrainerValue(temporadas, trainerName) {

    const resultados = [];

    let acumuladoValor = 0;

    let acumuladoPuntos = 0;

    const lowerCaseTrainerName = trainerName.toLowerCase();

    temporadas.forEach(temp => {

      let puntosTemp = 0;

      let titlesTemp = [];

      

      for (const torneo in temp) {

        if (temp.hasOwnProperty(torneo) && torneo !== "TEMPORADA") {

          const valorTorneo = temp[torneo];

          if (torneo.toLowerCase() === "mundial" && typeof valorTorneo === "object") {

            for (const puesto in valorTorneo) {

              if (valorTorneo.hasOwnProperty(puesto) && valorTorneo[puesto].toLowerCase() === lowerCaseTrainerName) {

                puntosTemp += puntos["MUNDIAL"][puesto];

                titlesTemp.push(`MUNDIAL (${puesto})`);

              }

            }

          } else if (typeof valorTorneo === "string" && valorTorneo.toLowerCase() === lowerCaseTrainerName) {

            const key = Object.keys(puntos).find(k => k.toLowerCase() === torneo.toLowerCase());

            if (key) {

              puntosTemp += puntos[key];

              titlesTemp.push(key);

            }

          }

        }

      }

      

      const valorGanado = puntosTemp * 50000;

      acumuladoValor += valorGanado;

      acumuladoPuntos += puntosTemp;

      resultados.push({

        temporada: temp.TEMPORADA,

        puntosTemp: puntosTemp,

        puntosAcumulados: acumuladoPuntos,

        valorGanado: valorGanado,

        valorAcumulado: acumuladoValor,

        titlesTemp: titlesTemp

      });

    });

    return resultados;

  }

  

  function displayTotalSummary(resultados) {

    const totalAcumulado = resultados[resultados.length - 1].valorAcumulado;

    const totalPuntos = resultados[resultados.length - 1].puntosAcumulados;

    totalPointsDiv.innerHTML = `

      Puntos Totales: <strong>${totalPuntos}</strong> | Valor Acumulado Total: <strong>¥${totalAcumulado.toLocaleString()}</strong>

    `;

  }

  function displayRecords(resultados) {

    let maxPuntosTemp = { puntos: 0, temporada: '' };

    let maxValorJump = { jump: 0, temporada: '' };

    

    resultados.forEach((res, index) => {

      if (res.puntosTemp > maxPuntosTemp.puntos) {

        maxPuntosTemp = { puntos: res.puntosTemp, temporada: res.temporada };

      }

      

      if (index > 0) {

        const jump = res.valorGanado;

        if (jump > maxValorJump.jump) {

          maxValorJump = { jump: jump, temporada: res.temporada };

        }

      }

    });

    recordsContainer.innerHTML = `

      <h3>Récords del Entrenador</h3>

      <p class="record-item">Mayor cantidad de puntos en una temporada: <strong>${maxPuntosTemp.puntos}</strong> puntos (${maxPuntosTemp.temporada})</p>

      <p class="record-item">Mayor salto de valor en una temporada: <strong>¥${maxValorJump.jump.toLocaleString()}</strong> (${maxValorJump.temporada})</p>

    `;

  }

  

  function createAnnualSummaryRow(yearNumber, currentResult, annualTotals) {

    const tr = document.createElement('tr');

    tr.className = 'annual-summary';

    tr.innerHTML = `

      <td colspan="5">

        <span style="font-size: 1.1em;">AÑO ${yearNumber} COMPLETADO</span><br>

        Puntos: <span style="color: #FFD700;">${annualTotals.points.toLocaleString()}</span> (Anual) / ${currentResult.puntosAcumulados.toLocaleString()} (Total)

        | Títulos: <span style="color: #FFD700;">${annualTotals.titles}</span> (Anual) / ${currentResult.titlesAcumulados} (Total)

        | Valor: <span style="color: #FFD700;">¥${annualTotals.value.toLocaleString()}</span> (Anual) / ¥${currentResult.valorAcumulado.toLocaleString()} (Total)

      </td>

    `;

    return tr;

  }

  function createSeasonRow(row) {

    const tr = document.createElement('tr');

    const colorClass = getValueColorClass(row.valorAcumulado);

    tr.innerHTML = `

      <td>${row.temporada}</td>

      <td>${row.puntosTemp}</td>

      <td>${row.puntosAcumulados.toLocaleString()}</td>

      <td>${row.titlesTemp.join(', ') || '—'}</td>

      <td class="${colorClass}">¥${row.valorAcumulado.toLocaleString()}</td>

    `;

    return tr;

  }

  function animateTable(data) {

    const totalRows = data.length;

    const tbody = resultsTableContainer.querySelector('tbody');

    let i = 0;

    let accumulatedTitlesCount = 0;

    let annualTotals = { points: 0, titles: 0, value: 0 };

    let yearNumber = 1;

    

    // Función recursiva para la animación

    const processNextRow = () => {

      if (i < totalRows) {

        const row = data[i];

        

        // 1. Acumular y actualizar totales

        accumulatedTitlesCount += row.titlesTemp.length;

        row.titlesAcumulados = accumulatedTitlesCount;

        annualTotals.points += row.puntosTemp;

        annualTotals.titles += row.titlesTemp.length;

        annualTotals.value += row.valorGanado;

        // 2. Insertar Fila de Temporada

        const seasonRow = createSeasonRow(row);

        tbody.appendChild(seasonRow);

        

        // 3. Insertar Resumen Anual

        const isEndOfYear = (i + 1) % SEASONS_PER_YEAR === 0;

        const isFinalRow = i === totalRows - 1;

        if (isEndOfYear || isFinalRow) {

             // Solo inserta un resumen si es el final de un año completo o la última fila

             if (isEndOfYear || (isFinalRow && totalRows % SEASONS_PER_YEAR !== 0)) {

                const summaryRow = createAnnualSummaryRow(yearNumber, row, annualTotals);

                tbody.appendChild(summaryRow);

                annualTotals = { points: 0, titles: 0, value: 0 }; // Reiniciar conteo anual

                yearNumber++;

             }

        }

        // 4. Actualizar barra de progreso y pasar a la siguiente

        const progress = ((i + 1) / totalRows) * 100;

        progressBarFill.style.width = `${progress}%`;

        i++;

        const delay = isSkipping ? 0 : 150; // Delay normal o 0 si salta

        const timeoutId = setTimeout(processNextRow, delay);

        animationTimeouts.push(timeoutId);

      } else {

        // 5. Finalizar

        displayTotalSummary(data);

        displayRecords(data);

        progressBarFill.style.width = "100%";

        

        // Finalizar y limpiar

        const finalTimeout = setTimeout(() => {

            showMessage("¡Cálculo completado exitosamente! 🎉", "success");

            setLoadingState(false);

        }, 500);

        animationTimeouts.push(finalTimeout);

      }

    };

    

    // Iniciar la animación

    processNextRow();

  }

  

  // --- Event Listeners ---

  

  function startCalculation(shouldSkip) {

      clearResults();

      setLoadingState(true);

      isSkipping = shouldSkip; // Establecer el modo de salto al inicio

      const jsonInputVal = jsonInput.value.trim();

      const trainerName = trainerNameInput1.value.trim();

      const initialTimeout = setTimeout(() => {

          if (!jsonInputVal || !trainerName) {

            showMessage("Por favor, ingresa el JSON y el nombre del entrenador.", "error");

            setLoadingState(false);

            return;

          }

          let temporadas;

          try {

            temporadas = JSON.parse(jsonInputVal);

            if (!Array.isArray(temporadas) || temporadas.length === 0) {

              throw new Error("El JSON debe ser un array no vacío de objetos.");

            }

          } catch (e) {

            showMessage(`JSON inválido: El JSON no está bien formado. Revisa las comillas y corchetes.`, "error");

            setLoadingState(false);

            return;

          }

          const resultados = calculateTrainerValue(temporadas, trainerName);

          dataToProcess = resultados;

          

          if (resultados.every(res => res.puntosTemp === 0)) {

            showMessage(`No se encontraron puntos para el entrenador "${trainerName}". Revisa la ortografía.`, "error");

            setLoadingState(false);

            return;

          }

          resultsTableContainer.innerHTML = `

            <table>

              <thead>

                <tr>

                  <th>Temp.</th>

                  <th>Puntos Temp</th>

                  <th>Puntos Acum.</th>

                  <th>Títulos Ganados</th>

                  <th>Valor Acumulado</th>

                </tr>

              </thead>

              <tbody></tbody>

            </table>

          `;

          animateTable(resultados);

      }, 500);

      animationTimeouts.push(initialTimeout);

  }

  

  // Asignación de listeners a los botones estáticos

  calculateBtn.addEventListener("click", () => {

      if (!calculateBtn.disabled) {

          startCalculation(false);

      }

  });

  

  skipCalculateBtn.addEventListener("click", () => {

      if (!skipCalculateBtn.disabled) {

          startCalculation(true);

      }

  });

});