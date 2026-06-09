// ==========================================================================
// REGISTRO DE MOTOR OFFLINE (PWA)
// ==========================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Blindaje Offline Activado - Scope:', reg.scope))
        .catch(err => console.error('Fallo crítico en registro SW:', err));
    });
}

(function() {
    // ==========================================================================
    // VARIABLES TÁCTICAS GLOBALES
    // ==========================================================================
    let allAlgaeData = [];
    let groupStyles = {};
    let groupDetails = {};
    let allAlgaeGroups = {};
    let allAlgasForSearch = [];

    // Bases de Datos Locales (Telemetría y Caché de Cero Latencia)
    let quizStats = JSON.parse(localStorage.getItem('talofitas_stats')) || {};
    let imageCache = JSON.parse(localStorage.getItem('talofitas_images')) || {};

    // Punteros del DOM
    let catalogo, algaSeleccionada, detallesAlga, imagenAlga, botonImagen, contenedorImagen, cargando, searchInput, modeToggle, surpriseBtn;
    let compareGroupsBtn, compareModal, closeCompareModal, groupSelect1, groupSelect2, doCompareBtn, compareTableContainer;
    let startQuizBtn, quizModal, closeQuizModal, quizSetupScreen, quizGameScreen, quizResultsScreen;
    let quizModeAllBtn, quizModeGroupBtn, quizGroupSelectionDiv, quizGroupDropdown, quizStartGroupBtn;
    let quizImage, quizSpinner, quizOptions, quizFeedback, quizProgress, quizScoreEl;
    let quizFinalScoreNumber, quizFinalMessage, quizRestartBtn, quizHomeBtn;

    // Variables de Ejecución del Quiz
    let quizQuestions = [];
    let currentQuizQuestion = 0;
    let quizScore = 0;
    const QUIZ_LENGTH = 10;
    let quizType = "visual"; 
    let bancoTeoriaDinamico = null;

    // ==========================================================================
    // CARGA Y SINCRONIZACIÓN DE ARSENAL DE DATOS
    // ==========================================================================
    async function cargarDatos() {
        try {
            const response = await fetch('data/data.json?v=' + new Date().getTime());
            if (!response.ok) throw new Error(`Fallo de conexión con data.json`);
            const data = await response.json();

            allAlgaeData = data.algae;
            groupStyles = data.groupStyles;
            groupDetails = data.groupDetails;

            allAlgaeData.forEach(alga => {
                if (!allAlgaeGroups[alga.group]) allAlgaeGroups[alga.group] = [];
                allAlgaeGroups[alga.group].push(alga.name);
                allAlgasForSearch.push({ name: alga.name, group: alga.group });
            });

            const orderedGroups = {};
            Object.keys(allAlgaeGroups).sort().forEach(groupName => { 
                orderedGroups[groupName] = allAlgaeGroups[groupName].sort(); 
            });
            allAlgaeGroups = orderedGroups;

            renderCatalogo(allAlgaeGroups);
            populateGroupSelects();
        } catch (error) {
            console.error("Error fatal de lectura:", error);
            catalogo.innerHTML = `<p class="search-no-results">Error crítico al cargar el catálogo principal.</p>`;
        }
    }

    async function cargarBancoTeoria() {
        if (bancoTeoriaDinamico !== null) return true;
        try {
            const respuesta = await fetch(`data/teoria.json`);
            if (!respuesta.ok) throw new Error("Error de telemetría teórica");
            bancoTeoriaDinamico = await respuesta.json();
            return true;
        } catch (error) {
            console.error("Fallo de banco teórico:", error);
            alert("No se pudo cargar la base teórica. Verifique su archivo json.");
            return false;
        }
    }

    // ==========================================================================
    // ALGORITMO DE REPETICIÓN ESPACIADA (SRS) E INTELIGENCIA ESTADÍSTICA
    // ==========================================================================
    function recordAnswerStats(id, isCorrect) {
        if (!quizStats[id]) quizStats[id] = { attempts: 0, correct: 0 };
        quizStats[id].attempts++;
        if (isCorrect) quizStats[id].correct++;
        localStorage.setItem('talofitas_stats', JSON.stringify(quizStats));
    }

    function getWeightedDataset(dataset, isTheory = false) {
        // Cálculo matemático: Aislar puntos ciegos para forzar aprendizaje
        return dataset.map(item => {
            const id = isTheory ? item.q : item.name;
            const stat = quizStats[id] || { attempts: 0, correct: 0 };
            const errorRate = stat.attempts === 0 ? 1 : 1 - (stat.correct / stat.attempts);
            const weight = errorRate + (Math.random() * 0.4); // Balance de 60% Inteligencia / 40% Aleatoriedad
            return { item, weight };
        }).sort((a, b) => b.weight - a.weight).map(obj => obj.item);
    }

    // ==========================================================================
    // RENDERIZADO DE INTERFAZ Y COMPONENTES VISUALES
    // ==========================================================================
    function populateGroupSelects() {
        const groups = Object.keys(groupStyles).sort();
        [groupSelect1, groupSelect2, quizGroupDropdown].forEach(select => {
            if(select) {
                select.innerHTML = '<option value="" disabled selected>Selecciona un grupo</option>';
                groups.forEach(g => {
                    const option = document.createElement('option');
                    option.value = g;
                    option.textContent = `${groupStyles[g].emoji} ${g}`;
                    select.appendChild(option);
                });
            }
        });
    }

    function renderQuizCheckboxes() {
        const container = document.getElementById('quiz-checkboxes-grid');
        container.innerHTML = '';
        Object.keys(groupStyles).sort().forEach(g => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox'; 
            checkbox.value = g; 
            checkbox.className = 'quiz-group-checkbox';
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${groupStyles[g].emoji} ${g}`));
            container.appendChild(label);
        });
    }

    function renderCatalogo(filteredGrupos) {
        catalogo.innerHTML = ''; 
        for (const grupoName in filteredGrupos) {
            const divGrupo = document.createElement("div"); 
            divGrupo.className = "grupo animate__animated animate__fadeInUp";

            const h2 = document.createElement("h2");
            const groupStyle = groupStyles[grupoName];
            h2.innerHTML = `${groupStyle.emoji} ${grupoName}`; 
            h2.style.backgroundColor = groupStyle.color; 
            h2.onclick = () => toggleAccordion(divGrupo);
            divGrupo.appendChild(h2);

            const ul = document.createElement("ul");
            filteredGrupos[grupoName].forEach(nombre => {
                const li = document.createElement("li"); 
                li.textContent = nombre;
                li.onclick = () => mostrarAlga(nombre);
                ul.appendChild(li);
            });
            divGrupo.appendChild(ul); 
            catalogo.appendChild(divGrupo);
        }
    }

    function toggleAccordion(divGrupo) {
        const ul = divGrupo.querySelector('ul');
        const isActive = divGrupo.classList.contains('active');

        document.querySelectorAll('.grupo.active').forEach(openGrupo => {
            if (openGrupo !== divGrupo) { 
                openGrupo.classList.remove('active'); 
                openGrupo.querySelector('ul').style.maxHeight = null; 
            }
        });

        if (isActive) { 
            divGrupo.classList.remove('active'); 
            ul.style.maxHeight = null; 
        } else { 
            divGrupo.classList.add('active'); 
            ul.style.maxHeight = "2500px"; 
        }
    }

    // ==========================================================================
    // SISTEMA PREDICTIVO AUTOCOMPLETADO
    // ==========================================================================
    function initAutocomplete() {
        const autocompleteList = document.getElementById('autocomplete-list');

        searchInput.addEventListener('input', function() {
            const val = this.value.trim();
            autocompleteList.innerHTML = '';

            if (!val) { 
                autocompleteList.style.display = 'none'; 
                return; 
            }

            const matches = allAlgasForSearch.filter(a => a.name.toLowerCase().includes(val.toLowerCase()));

            if (matches.length > 0) {
                autocompleteList.style.display = 'block';
                matches.slice(0, 8).forEach(match => { // Limitar a 8 resultados directos
                    const div = document.createElement('div');
                    div.innerHTML = `<span>${match.name}</span> <span class="autocomplete-group-badge">${groupStyles[match.group].emoji} ${match.group}</span>`;
                    div.addEventListener('click', function() {
                        searchInput.value = match.name;
                        autocompleteList.style.display = 'none';
                        mostrarAlga(match.name);
                    });
                    autocompleteList.appendChild(div);
                });
            } else { 
                autocompleteList.style.display = 'none'; 
            }
        });

        // Ocultar al hacer clic fuera del buscador
        document.addEventListener('click', function(e) {
            if (e.target !== searchInput) autocompleteList.style.display = 'none';
        });
    }

    // ==========================================================================
    // MOTOR DE BÚSQUEDA Y EXTRACCIÓN DE IMÁGENES (CON CACHÉ 0 LATENCIA)
    // ==========================================================================
    async function buscarAPI(nombre, tipo) {
        if (imageCache[nombre]) return imageCache[nombre]; // Retorno instantáneo si ya existe

        try {
            let url = tipo === 'wiki' 
                ? `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(nombre + ' microalga')}&srnamespace=6&srlimit=1&origin=*`
                : `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(nombre)}&photos=true&per_page=1&quality_grade=research`;

            const response = await fetch(url);
            const data = await response.json();
            let finalUrl = null;

            if (tipo === 'wiki' && data.query?.search?.length > 0) {
                finalUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(data.query.search[0].title.replace('File:', ''))}`;
            } else if (tipo === 'inat' && data.results?.[0]?.photos?.length > 0) {
                finalUrl = data.results[0].photos[0].url.replace('square', 'original');
            }

            if (finalUrl) {
                imageCache[nombre] = finalUrl;
                localStorage.setItem('talofitas_images', JSON.stringify(imageCache));
                return finalUrl;
            }
        } catch (e) { 
            console.log("Fallo de red interceptado, reintentando protocolos locales."); 
        }
        return null;
    }

    async function mostrarAlga(nombre) {
        document.getElementById("result").scrollIntoView({ behavior: 'smooth', block: 'start' });
        algaSeleccionada.textContent = nombre;
        contenedorImagen.style.display = "none"; 
        cargando.style.display = "flex";
        botonImagen.style.display = "inline-block"; 
        botonImagen.dataset.nombre = nombre;

        const algaData = allAlgaeData.find(a => a.name === nombre);
        const grupo = algaData ? algaData.group : null;

        if (grupo && groupDetails[grupo]) {
            detallesAlga.style.setProperty('--group-color', groupStyles[grupo].color);
            let html = `<h3>Detalles: ${grupo}</h3><dl>`;
            for (const key in groupDetails[grupo]) {
                html += `<dt>${key}</dt><dd>${groupDetails[grupo][key]}</dd>`;
            }
            detallesAlga.innerHTML = html + "</dl>"; 
            detallesAlga.style.display = "block";
        } else { 
            detallesAlga.style.display = "none"; 
        }

        let imgUrl = algaData?.img;
        if (!imgUrl || !imgUrl.startsWith('http')) {
            imgUrl = await buscarAPI(nombre, 'wiki') || await buscarAPI(nombre, 'inat');
        }

        if (imgUrl) {
            imagenAlga.src = imgUrl; // Eliminado evasor de caché para operar offline
            cargando.style.display = "none";
            contenedorImagen.style.display = "inline-block";
            contenedorImagen.classList.remove('animate__fadeIn'); 
            void contenedorImagen.offsetWidth;
            contenedorImagen.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            cargando.style.display = "none";
            algaSeleccionada.innerHTML = `${nombre}<br><small style="color: orange">Sin imagen registrada en la base de datos.</small>`;
        }
    }

    // ==========================================================================
    // SISTEMA DE ANÁLISIS COMPARATIVO
    // ==========================================================================
    function openCompareModal() { compareModal.style.display = 'block'; }

    function performGroupCompare() {
        const g1 = groupSelect1.value; 
        const g2 = groupSelect2.value;

        if (!g1 || !g2) { 
            alert("Operación denegada. Seleccione dos variables para comparar."); 
            return; 
        }

        const details1 = groupDetails[g1]; 
        const details2 = groupDetails[g2];
        const allKeys = Array.from(new Set([...Object.keys(details1), ...Object.keys(details2)]));

        let html = `<table class="compare-table"><tr><th>Característica</th><th>${groupStyles[g1].emoji} ${g1}</th><th>${groupStyles[g2].emoji} ${g2}</th></tr>`;
        allKeys.forEach(key => {
            html += `<tr><td><strong>${key}</strong></td><td>${details1[key] || '-'}</td><td>${details2[key] || '-'}</td></tr>`;
        });
        compareTableContainer.innerHTML = html + '</table>';
    }

    // ==========================================================================
    // LÓGICA DEL SIMULADOR TÁCTICO (QUIZ)
    // ==========================================================================
    function openQuizModal() { 
        quizModal.style.display = 'block'; 
        showQuizSetup(); 
    }

    function showQuizSetup() {
        quizSetupScreen.style.display = 'block'; 
        quizGameScreen.style.display = 'none';
        quizResultsScreen.style.display = 'none'; 
        quizGroupSelectionDiv.style.display = 'none';
        document.getElementById('type-visual-radio').checked = true; 
        quizType = "visual";
    }

    async function setupQuizMode(mode) {
        if (quizType === 'teoria' && !(await cargarBancoTeoria())) return;

        if (mode === 'all') {
            let fullData = quizType === 'visual' ? allAlgaeData : Object.values(bancoTeoriaDinamico).flat();
            initQuizGame(fullData);
        } else {
            quizGroupSelectionDiv.style.display = 'block';
            if (quizType === 'teoria') {
                singleGroupContainer.style.display = 'none'; 
                multipleGroupContainer.style.display = 'block'; 
                renderQuizCheckboxes();
            } else {
                singleGroupContainer.style.display = 'block'; 
                multipleGroupContainer.style.display = 'none';
            }
        }
    }

        async function startGroupQuiz() {
        if (quizType === 'visual') {
            const group = quizGroupDropdown.value;
            if (!group) return alert("Parámetro inválido. Seleccione un grupo.");
            const filtered = allAlgaeData.filter(a => a.group === group);
            if (filtered.length < 4) return alert("Volumen de muestra estadísticamente insuficiente (Mínimo 4).");
            initQuizGame(filtered);
        } else {
            // BLINDAJE TÁCTICO: Obligar al sistema a confirmar la descarga teórica antes de avanzar
            const cargado = await cargarBancoTeoria();
            if (!cargado) return;

            const checked = document.querySelectorAll('.quiz-group-checkbox:checked');
            if (checked.length === 0) return alert("Seleccione objetivo táctico.");
            let pool = [];
            checked.forEach(box => { 
                if (bancoTeoriaDinamico[box.value]) pool = pool.concat(bancoTeoriaDinamico[box.value]); 
            });
            if (pool.length === 0) return alert("No hay datos teóricos en la selección.");
            initQuizGame(pool);
        }
    }

    function initQuizGame(dataset) {
        quizQuestions = []; 
        quizScore = 0; 
        currentQuizQuestion = 0;

        // Selección Inteligente (Algoritmo SRS)
        const weightedDataset = getWeightedDataset(dataset, quizType === 'teoria');
        const selected = weightedDataset.slice(0, Math.min(QUIZ_LENGTH, weightedDataset.length));

        if (quizType === 'visual') {
            const valid = dataset.filter(a => a.img && a.img.trim() !== "");
            selected.forEach(correctAlga => {
                const wrong = valid.filter(a => a.name !== correctAlga.name)
                                   .sort(() => 0.5 - Math.random())
                                   .slice(0, 3).map(a => a.name);
                quizQuestions.push({ 
                    id: correctAlga.name, 
                    image: correctAlga.img, 
                    correctAnswer: correctAlga.name, 
                    options: [correctAlga.name, ...wrong].sort(() => 0.5 - Math.random()) 
                });
            });
        } else {
            selected.forEach(qData => {
                quizQuestions.push({ 
                    id: qData.q, 
                    isTheory: true, 
                    questionText: qData.q, 
                    correctAnswer: qData.options[qData.correct], 
                    options: [...qData.options] 
                });
            });
        }

        quizSetupScreen.style.display = 'none'; 
        quizGameScreen.style.display = 'block';
        loadQuizQuestion();
    }

    async function loadQuizQuestion() {
        if (currentQuizQuestion >= quizQuestions.length) return finishQuiz();

        const q = quizQuestions[currentQuizQuestion];
        quizOptions.innerHTML = ''; 
        quizFeedback.className = '';
        quizProgress.textContent = `Fase ${currentQuizQuestion + 1} / ${quizQuestions.length}`;
        quizScoreEl.textContent = `Rendimiento: ${quizScore}`;

        const questionTextEl = document.querySelector('.quiz-question-text');

        if (q.isTheory) {
            document.getElementById('quiz-image-container').style.display = 'none';
            quizSpinner.style.display = 'none'; 
            questionTextEl.textContent = q.questionText;
        } else {
            document.getElementById('quiz-image-container').style.display = 'flex';
            quizImage.style.display = 'none'; 
            quizSpinner.style.display = 'block';
            questionTextEl.textContent = 'Identifique el espécimen:';

            let imgUrl = q.image;
            if (!imgUrl || !imgUrl.startsWith('http')) {
                imgUrl = await buscarAPI(q.correctAnswer, 'wiki') || await buscarAPI(q.correctAnswer, 'inat');
            }
            if (imgUrl) { 
                quizImage.src = imgUrl; 
                quizImage.onload = () => { 
                    quizSpinner.style.display = 'none'; 
                    quizImage.style.display = 'block'; 
                }; 
            }
        }

        q.options.forEach(opt => {
            const btn = document.createElement('button'); 
            btn.className = 'quiz-option-btn'; 
            btn.textContent = opt;
            btn.onclick = (e) => checkQuizAnswer(opt, q.correctAnswer, q.id, e.target);
            quizOptions.appendChild(btn);
        });
    }

    function checkQuizAnswer(selected, correct, questionId, btnElement) {
        document.querySelectorAll('.quiz-option-btn').forEach(b => {
            b.disabled = true; 
            if (b.textContent === correct) b.classList.add('correct');
        });

        const isCorrect = (selected === correct);
        recordAnswerStats(questionId, isCorrect); // Inyección de datos al Motor Estadístico SRS

        if (isCorrect) { 
            quizScore++; 
            quizFeedback.textContent = "VERIFICADO"; 
            quizFeedback.className = 'correct'; 
        } else { 
            btnElement.classList.add('wrong'); 
            quizFeedback.textContent = "NEGATIVO"; 
            quizFeedback.className = 'wrong'; 
        }

        setTimeout(() => { 
            currentQuizQuestion++; 
            loadQuizQuestion(); 
        }, 1200);
    }

    function finishQuiz() {
        quizGameScreen.style.display = 'none'; 
        quizResultsScreen.style.display = 'block';
        quizFinalScoreNumber.textContent = quizScore;
        const p = quizScore / quizQuestions.length;
        quizFinalMessage.textContent = p >= 0.99 ? "Precisión Táctica Absoluta." : p >= 0.7 ? "Rendimiento Aceptable. Margen de error detectado." : "Fallo Crítico. Reentrenamiento requerido.";
    }

    // ==========================================================================
    // INICIALIZACIÓN DEL SISTEMA PRINCIPAL (BOOT)
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        // Asignación de variables al DOM
        catalogo = document.getElementById("catalogo"); algaSeleccionada = document.getElementById("algaSeleccionada");
        detallesAlga = document.getElementById("detalles-alga"); imagenAlga = document.getElementById("imagenAlga");
        botonImagen = document.getElementById("buscarImagen"); contenedorImagen = document.getElementById("contenedorImagen");
        cargando = document.getElementById("cargando"); searchInput = document.getElementById("search-input");
        modeToggle = document.getElementById("mode-toggle"); surpriseBtn = document.getElementById("surprise-btn");
        compareGroupsBtn = document.getElementById("compare-groups-btn"); compareModal = document.getElementById("compare-modal");
        closeCompareModal = document.getElementById("close-compare-modal"); groupSelect1 = document.getElementById("group-select-1");
        groupSelect2 = document.getElementById("group-select-2"); doCompareBtn = document.getElementById("do-compare-btn");
        compareTableContainer = document.getElementById("compare-table-container"); startQuizBtn = document.getElementById("start-quiz-btn");
        quizModal = document.getElementById("quiz-modal"); closeQuizModal = document.getElementById("close-quiz-modal");
        quizSetupScreen = document.getElementById("quiz-setup"); quizGameScreen = document.getElementById("quiz-game");
        quizResultsScreen = document.getElementById("quiz-results"); quizModeAllBtn = document.getElementById("quiz-mode-all");
        quizModeGroupBtn = document.getElementById("quiz-mode-group"); quizGroupSelectionDiv = document.getElementById("quiz-group-selection");
        quizGroupDropdown = document.getElementById("quiz-group-dropdown"); quizStartGroupBtn = document.getElementById("quiz-start-group-btn");
        quizImage = document.getElementById("quiz-image"); quizSpinner = document.getElementById("quiz-spinner");
        quizOptions = document.getElementById("quiz-options"); quizFeedback = document.getElementById("quiz-feedback");
        quizProgress = document.getElementById("quiz-progress"); quizScoreEl = document.getElementById("quiz-score");
        quizFinalScoreNumber = document.getElementById("quiz-final-score-number"); quizFinalMessage = document.getElementById("quiz-final-message");
        quizRestartBtn = document.getElementById("quiz-restart-btn"); quizHomeBtn = document.getElementById("quiz-home-btn");
        window.singleGroupContainer = document.getElementById('quiz-single-group-container');
        window.multipleGroupContainer = document.getElementById('quiz-multiple-group-container');

        // Fase de Boot
        cargarDatos().then(() => initAutocomplete());

        // Control de Ambiente Lumínico
        modeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            modeToggle.textContent = isDark ? '☀️' : '🌙';
        });
        if (localStorage.getItem('darkMode') === 'true') { 
            document.body.classList.add('dark-mode'); 
            modeToggle.textContent = '☀️'; 
        }

        // Asignación de Controles Operativos
        surpriseBtn.addEventListener('click', () => { 
            if(allAlgaeData.length) mostrarAlga(allAlgaeData[Math.floor(Math.random() * allAlgaeData.length)].name); 
        });

        compareGroupsBtn.addEventListener('click', openCompareModal); 
        closeCompareModal.addEventListener('click', () => compareModal.style.display = 'none');
        doCompareBtn.addEventListener('click', performGroupCompare); 

        startQuizBtn.addEventListener('click', openQuizModal);
        closeQuizModal.addEventListener('click', () => quizModal.style.display = 'none'); 
        quizModeAllBtn.addEventListener('click', () => setupQuizMode('all'));

                // Reemplazo del bloque de botones de modalidad
        quizModeGroupBtn.addEventListener('click', () => setupQuizMode('group'));

        document.getElementById('type-visual-radio').addEventListener('change', () => { 
            quizType = "visual"; 
            if (quizGroupSelectionDiv.style.display === 'block') { 
                singleGroupContainer.style.display = 'block'; 
                multipleGroupContainer.style.display = 'none'; 
            } 
        });
        
        document.getElementById('type-teoria-radio').addEventListener('change', async () => { 
            quizType = "teoria"; 
            if (quizGroupSelectionDiv.style.display === 'block') { 
                singleGroupContainer.style.display = 'none'; 
                multipleGroupContainer.style.display = 'block'; 
                await cargarBancoTeoria(); // Sincronización estricta al cambiar de pestaña
                renderQuizCheckboxes(); 
            } 
        });


        document.getElementById('type-teoria-radio').addEventListener('change', () => { 
            quizType = "teoria"; 
            if (quizGroupSelectionDiv.style.display === 'block') { 
                singleGroupContainer.style.display = 'none'; 
                multipleGroupContainer.style.display = 'block'; 
                renderQuizCheckboxes(); 
            } 
        });

        quizStartGroupBtn.addEventListener('click', startGroupQuiz); 
        quizRestartBtn.addEventListener('click', showQuizSetup);
        quizHomeBtn.addEventListener('click', () => quizModal.style.display = 'none');

        window.onclick = (e) => { 
            if (e.target == compareModal) compareModal.style.display = 'none'; 
            if (e.target == quizModal) quizModal.style.display = 'none'; 
            if (e.target == document.getElementById("modalImagen")) cerrarModal(); 
        };

        window.cerrarModal = () => { 
            const m = document.getElementById("modalImagen"); 
            m.classList.remove('animate__fadeIn'); 
            m.classList.add('animate__fadeOut'); 
            setTimeout(() => { m.style.display = "none"; m.classList.remove('animate__fadeOut'); }, 300); 
        };

        window.abrirPantallaCompleta = () => { 
            const m = document.getElementById("modalImagen"); 
            document.getElementById("imagenModal").src = imagenAlga.src; 
            m.style.display = "block"; m.classList.add('animate__fadeIn'); 
        };

        window.buscarEnGoogleImages = () => { 
            const n = botonImagen.dataset.nombre; 
            if(n) window.open(`https://www.google.com/search?q=${encodeURIComponent(n)}+microalga&tbm=isch`, '_blank'); 
        };

        window.recomendarAlgas = () => window.open("https://docs.google.com/forms/d/e/1FAIpQLScKt3p1B_aV5KCY2r5icR33LhkexEpVjzoRWiHY6WSa-HmXQA/viewform", "_blank");
        window.reportarError = () => window.open("https://forms.gle/NBTfqCXDpu8RHBwf9", "_blank");
    });
})();
