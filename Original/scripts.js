document.addEventListener('DOMContentLoaded', function () {
    const phHistory = [];
    const electronegativityHistory = [];
    const temperatureHistory = [];

    async function fetchData() {
        try {
            const response = await fetch('http://<ESP32_IP>/');
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Dispositivo no conectado');
            }
        } catch (error) {
            return null;
        }
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
            return recommendations[sectionId].low[Math.floor(Math.random() * recommendations[sectionId].low.length)];
        } else if (value > average * 1.5) {
            return recommendations[sectionId].high[Math.floor(Math.random() * recommendations[sectionId].high.length)];
        } else {
            return recommendations[sectionId].normal[Math.floor(Math.random() * recommendations[sectionId].normal.length)];
        }
    }

    function addActivityLog(sectionId, value, average) {
        const activityLog = document.getElementById('activity-log');
        const timestamp = new Date().toLocaleString();
        let message = '';

        if (sectionId === 'ph') {
            if (value < average * 0.8) {
                message = 'El pH está más bajo de lo normal';
            } else if (value > average * 1.2 && value <= average * 1.5) {
                message = 'El pH está más alto de lo normal';
            } else if (value > average * 1.5) {
                message = 'El pH está peligrosamente alto';
            }
        } else if (sectionId === 'electronegativity') {
            if (value < average * 0.8) {
                message = 'La electronegatividad está más baja de lo normal';
            } else if (value > average * 1.2 && value <= average * 1.5) {
                message = 'La electronegatividad está más alta de lo normal';
            } else if (value > average * 1.5) {
                message = 'La electronegatividad está peligrosamente alta';
            }
        } else if (sectionId === 'temperature') {
            if (value < average * 0.8) {
                message = 'La temperatura está más baja de lo normal';
            } else if (value > average * 1.2 && value <= average * 1.5) {
                message = 'La temperatura está más alta de lo normal';
            } else if (value > average * 1.5) {
                message = 'La temperatura está peligrosamente alta';
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
                    legend: {
                        display: true,
                        labels: {
                            color: 'black'
                        }
                    }
                }
            }
        });
    }

    async function updateSection(sectionId, history, latestValue) {
        const newValue = parseFloat(latestValue);

        const timestamp = new Date().toLocaleTimeString();
        history.push({ value: newValue, timestamp: timestamp });
        if (history.length > 10) {
            history.shift();
        }

        const average = history.reduce((sum, entry) => sum + entry.value, 0) / history.length;
        setSectionData(sectionId, newValue, average, history);
    }

    async function updateAllSections() {
        const data = await fetchData();
        if (data) {
            updateSection('ph', phHistory, data.ph);
            updateSection('electronegativity', electronegativityHistory, data.tds);
            updateSection('temperature', temperatureHistory, data.temperature);
        }
    }

    setInterval(updateAllSections, 10000); // Update every 10 seconds
});
