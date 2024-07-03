document.addEventListener('DOMContentLoaded', function () {
    const phHistory = [];
    const electronegativityHistory = [];
    const temperatureHistory = [];

    function getRandomValue(min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    function getRandomRecommendation(recommendations) {
        return recommendations[Math.floor(Math.random() * recommendations.length)];
    }

    function getRecommendations(sectionId, value, average) {
        const recommendations = {
            ph: {
                low: [
                    'Añadir bicarbonato de sodio.',
                    'Utilizar agentes alcalinizantes.',
                    'Incrementar la aireación del agua.'
                ],
                normal: [
                    'El pH está en el rango óptimo.',
                    'Mantener un monitoreo regular del pH.'
                ],
                high: [
                    'Añadir ácido muriático.',
                    'Usar agentes acidificantes.',
                    'Reducir la aireación del agua.'
                ]
            },
            electronegativity: {
                low: [
                    'Añadir bicarbonato de sodio.',
                    'Utilizar agentes alcalinizantes.',
                    'Incrementar la aireación del agua.'
                ],
                normal: [
                    'La electronegatividad está en el rango óptimo.',
                    'Mantener un monitoreo regular de la electronegatividad.'
                ],
                high: [
                    'Diluir con agua destilada.',
                    'Usar resinas de intercambio iónico.',
                    'Añadir agentes quelantes.'
                ]
            },
            temperature: {
                low: [
                    'Utilizar calentadores de agua.',
                    'Aumentar la exposición al sol.',
                    'Incrementar la circulación del agua.'
                ],
                normal: [
                    'La temperatura está en el rango óptimo.',
                    'Mantener un monitoreo regular de la temperatura.'
                ],
                high: [
                    'Usar sistemas de enfriamiento.',
                    'Aumentar la sombra sobre el agua.',
                    'Reducir la exposición directa al sol.'
                ]
            }
        };

        if (value < average * 0.8) {
            return getRandomRecommendation(recommendations[sectionId].low);
        } else if (value > average * 1.5) {
            return getRandomRecommendation(recommendations[sectionId].high);
        } else {
            return getRandomRecommendation(recommendations[sectionId].normal);
        }
    }

    function addActivityLog(sectionId, value, average) {
        const activityLog = document.getElementById('activity-log');
        const timestamp = new Date().toLocaleString();
        let message = '';

        if (sectionId === 'ph') {
            if (value < average * 0.8) {
                message = `El pH está más bajo de lo normal`;
            } else if (value > average * 1.2 && value <= average * 1.5) {
                message = `El pH está más alto de lo normal`;
            } else if (value > average * 1.5) {
                message = `El pH está peligrosamente alto`;
            }
        } else if (sectionId === 'electronegativity') {
            if (value < average * 0.8) {
                message = `La electronegatividad está más baja de lo normal`;
            } else if (value > average * 1.2 && value <= average * 1.5) {
                message = `La electronegatividad está más alta de lo normal`;
            } else if (value > average * 1.5) {
                message = `La electronegatividad está peligrosamente alta`;
            }
        } else if (sectionId === 'temperature') {
            if (value < average * 0.8) {
                message = `La temperatura está más baja de lo normal`;
            } else if (value > average * 1.2 && value <= average * 1.5) {
                message = `La temperatura está más alta de lo normal`;
            } else if (value > average * 1.5) {
                message = `La temperatura está peligrosamente alta`;
            }
        }

        const color = value < average * 0.8 ? 'grey' : value > average * 1.5 ? 'red' : 'yellow';
        if (message) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${color}`;
            logEntry.innerHTML = `${timestamp} - ${message} <span>⚠️</span>`;
            activityLog.prepend(logEntry);
        }
    }

    function setSectionData(sectionId, value, average, history) {
        const valueElement = document.getElementById(`${sectionId}-value`);
        const averageElement = document.getElementById(`${sectionId}-average`);
        const recommendationsElement = document.getElementById(`${sectionId}-recommendations`);
        const chart = document.getElementById(`${sectionId}-chart`).getContext('2d');

        valueElement.textContent = `Valor Actual: ${value}`;
        averageElement.textContent = `Promedio: ${average}`;

        const recommendation = getRecommendations(sectionId, value, average);
        recommendationsElement.innerHTML = `Recomendación: ${recommendation}`;

        const colorClass = value < average * 0.8 ? 'grey' : value > average * 1.5 ? 'red' : value > average * 1.2 ? 'yellow' : 'green';
        valueElement.className = `value ${colorClass}`;

        addActivityLog(sectionId, value, average);

        if (window[`${sectionId}Chart`]) {
            window[`${sectionId}Chart`].destroy();
        }

        window[`${sectionId}Chart`] = new Chart(chart, {
            type: 'line',
            data: {
                labels: history.map(entry => entry.timestamp),
                datasets: [{
                    label: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
                    data: history.map(entry => entry.value),
                    borderColor: colorClass,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy',
                        }
                    }
                }
            }
        });
    }

    function updateValues() {
        const phValue = parseFloat(getRandomValue(6, 9));
        const phAverage = thresholds.ph.average;
        phHistory.push({ timestamp: new Date().toLocaleString(), value: phValue });
        setSectionData('ph', phValue, phAverage, phHistory);

        const electronegativityValue = parseFloat(getRandomValue(2, 5));
        const electronegativityAverage = thresholds.electronegativity.average;
        electronegativityHistory.push({ timestamp: new Date().toLocaleString(), value: electronegativityValue });
        setSectionData('electronegativity', electronegativityValue, electronegativityAverage, electronegativityHistory);

        const temperatureValue = parseFloat(getRandomValue(15, 32));
        const temperatureAverage = thresholds.temperature.average;
        temperatureHistory.push({ timestamp: new Date().toLocaleString(), value: temperatureValue });
        setSectionData('temperature', temperatureValue, temperatureAverage, temperatureHistory);

        populateHistoryTable('ph', phHistory);
        populateHistoryTable('electronegativity', electronegativityHistory);
        populateHistoryTable('temperature', temperatureHistory);
    }

    function showMainContent() {
        document.querySelector('header').style.display = 'block';
        document.querySelector('main').style.display = 'flex';
        document.querySelector('footer').style.display = 'block';
        document.body.style.overflow = 'auto';
    }

    const toggleButton = document.getElementById('toggle-activity');
    toggleButton.addEventListener('click', () => {
        const activityLog = document.getElementById('activity-log');
        if (activityLog.classList.contains('minimized')) {
            activityLog.classList.remove('minimized');
            toggleButton.textContent = 'Minimizar';
        } else {
            activityLog.classList.add('minimized');
            toggleButton.textContent = 'Maximizar';
        }
    });

    function toggleDefinition(id) {
        const definition = document.getElementById(id);
        if (definition.style.display === 'none' || definition.style.display === '') {
            definition.style.display = 'block';
        } else {
            definition.style.display = 'none';
        }
    }

    document.getElementById('ph-info').addEventListener('click', () => toggleDefinition('ph-definition'));
    document.getElementById('electronegativity-info').addEventListener('click', () => toggleDefinition('electronegativity-definition'));
    document.getElementById('temperature-info').addEventListener('click', () => toggleDefinition('temperature-definition'));

    function populateHistoryTable(sectionId, history) {
        const table = document.getElementById(`${sectionId}-history-table`);
        table.innerHTML = `
            <tr>
                <th>Fecha y Hora</th>
                <th>Valor</th>
            </tr>
            ${history.map(entry => `
                <tr>
                    <td>${entry.timestamp}</td>
                    <td>${entry.value}</td>
                </tr>
            `).join('')}
        `;
    }

    async function exportToExcel(sectionId, history) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${sectionId}History`);

        worksheet.columns = [
            { header: 'Fecha y Hora', key: 'timestamp', width: 25 },
            { header: 'Valor', key: 'value', width: 10 }
        ];

        history.forEach(entry => {
            worksheet.addRow(entry);
        });

        // Add chart to worksheet
        const chartCanvas = document.getElementById(`${sectionId}-chart`);
        const imageData = chartCanvas.toDataURL('image/png');
        const imageId = workbook.addImage({
            base64: imageData,
            extension: 'png',
        });

        worksheet.addImage(imageId, {
            tl: { col: 3, row: 1 },
            ext: { width: 500, height: 300 }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sectionId}_history.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    }

    document.getElementById('export-ph-excel').addEventListener('click', () => exportToExcel('ph', phHistory));
    document.getElementById('export-electronegativity-excel').addEventListener('click', () => exportToExcel('electronegativity', electronegativityHistory));
    document.getElementById('export-temperature-excel').addEventListener('click', () => exportToExcel('temperature', temperatureHistory));

    setInterval(updateValues, 5000);

    document.getElementById('view-ph-history').addEventListener('click', () => {
        const table = document.getElementById('ph-history-table');
        table.style.display = table.style.display === 'none' || table.style.display === '' ? 'table' : 'none';
    });

    document.getElementById('view-electronegativity-history').addEventListener('click', () => {
        const table = document.getElementById('electronegativity-history-table');
        table.style.display = table.style.display === 'none' || table.style.display === '' ? 'table' : 'none';
    });

    document.getElementById('view-temperature-history').addEventListener('click', () => {
        const table = document.getElementById('temperature-history-table');
        table.style.display = table.style.display === 'none' || table.style.display === '' ? 'table' : 'none';
    });

    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        showMainContent();
        updateValues();
    }, 3000);

    // Código para la configuración de umbrales
    const thresholds = {
        ph: { low: 0, high: 14, average: 7.0 },
        electronegativity: { low: 0, high: 10, average: 3.0 },
        temperature: { low: -10, high: 50, average: 22.5 }
    };

    const configButton = document.getElementById('config-button');
    const configModal = document.getElementById('config-modal');
    const closeConfigButton = document.getElementById('close-config');
    const saveConfigButton = document.getElementById('save-config');

    configButton.addEventListener('click', () => {
        configModal.style.display = 'block';
    });

    closeConfigButton.addEventListener('click', () => {
        configModal.style.display = 'none';
    });

    saveConfigButton.addEventListener('click', () => {
        thresholds.ph.average = parseFloat(document.getElementById('ph-average-input').value);
        thresholds.electronegativity.average = parseFloat(document.getElementById('electronegativity-average-input').value);
        thresholds.temperature.average = parseFloat(document.getElementById('temperature-average-input').value);

        configModal.style.display = 'none';
    });
});

