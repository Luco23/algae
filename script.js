(function() {

    let allAlgaeData = [];
    let groupStyles = {};
    let groupDetails = {};
    let allAlgaeGroups = {};
    let allAlgasForSearch = [];

    let catalogo, algaSeleccionada, detallesAlga, imagenAlga, botonImagen, contenedorImagen, cargando, searchInput, modeToggle, surpriseBtn;

    let compareGroupsBtn, compareModal, closeCompareModal, groupSelect1, groupSelect2, doCompareBtn, compareTableContainer;

    let startQuizBtn, quizModal, closeQuizModal;
    let quizSetupScreen, quizGameScreen, quizResultsScreen;
    let quizModeAllBtn, quizModeGroupBtn, quizGroupSelectionDiv, quizGroupDropdown, quizStartGroupBtn;
    let quizImage, quizSpinner, quizOptions, quizFeedback, quizProgress, quizScoreEl;
    let quizFinalScoreNumber, quizFinalMessage, quizRestartBtn, quizHomeBtn;

    // Variables de Barra de Progreso Táctica
    let quizLoadingOverlay, quizLoadingText, quizProgressBar;

    let quizQuestions = [];
    let currentQuizQuestion = 0;
    let quizScore = 0;
    const QUIZ_LENGTH = 10;

    let quizType = "visual"; 
    let bancoTeoriaDinamico = null;

    // --- FUNCIONES DE PROGRESO ---
    async function updateProgress(percent, text) {
        quizLoadingOverlay.style.display = 'flex';
        quizProgressBar.style.width = percent + '%';
        quizLoadingText.textContent = text;
        // Blindaje para renderizado de interfaz antes de procesar cálculos densos
        await new Promise(resolve => setTimeout(resolve, 50)); 
    }

    function hideProgress() {
        quizLoadingOverlay.style.display = 'none';
        quizProgressBar.style.width = '0%';
    }

    // --- CARGA DE DATOS ---
    async function cargarDatos() {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) throw new Error(`Error al cargar data.json`);
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
            console.error("Error fatal:", error);
            catalogo.innerHTML = `<p class="search-no-results">Error al cargar el catálogo.</p>`;
        }
    }

    async function cargarBancoTeoria() {
        if (bancoTeoriaDinamico !== null) return true;
        try {
            const respuesta = await fetch(`data/teoria.json?t=${new Date().getTime()}`);
            if (!respuesta.ok) throw new Error("Error al cargar teoria.json");
            bancoTeoriaDinamico = await respuesta.json();
            return true;
        } catch (error) {
            console.error("Error de telemetría:", error);
            alert("No se pudo sincronizar el banco de preguntas teóricas.");
            return false;
        }
    }

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
        const groups = Object.keys(groupStyles).sort();

        groups.forEach(g => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '5px';
            label.style.cursor = 'pointer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = g;
            checkbox.className = 'quiz-group-checkbox';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`${groupStyles[g].emoji} ${g}`));
            container.appendChild(label);
        });
    }

    function renderCatalogo(filteredGrupos) {
        catalogo.innerHTML = ''; 
        allAlgasForSearch = []; 

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
                allAlgasForSearch.push({ name: nombre, group: grupoName, element: li });
            });
            divGrupo.appendChild(ul);
            catalogo.appendChild(divGrupo);
        }
    }

    function toggleAccordion(divGrupo) {
        const ul = divGrupo.querySelector('ul');
        const h2 = divGrupo.querySelector('h2');
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
            ul.style.maxHeight = "2000px"; 
        }
    }

    async function buscarEnWikimediaCommons(nombre) {
        try {
            const queries = [`${nombre} microalga`, `${nombre} algae`];
            for (const query of queries) {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=3&origin=*`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.query?.search?.length > 0) {
                    for (const res of data.query.search) {
                        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(res.title.replace('File:', ''))}`;
                    }
                }
            }
        } catch (e) { console.log(e); }
        return null;
    }

    async function buscarEnINaturalist(nombre) {
        try {
            const url = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(nombre)}&photos=true&per_page=3&quality_grade=research`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                for (const obs of data.results) {
                    if (obs.photos.length > 0) {
                        return obs.photos[0].url.replace('square', 'original');
                    }
                }
            }
        } catch (e) { console.log(e); }
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
            const color = groupStyles[grupo] ? groupStyles[grupo].color : '#0096c7';
            detallesAlga.style.setProperty('--group-color', color);
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
        let valid = false;

        if (imgUrl && imgUrl.trim() !== "" && imgUrl.startsWith('http')) {
            valid = true;
        } else {
            imgUrl = await buscarEnWikimediaCommons(nombre);
            if (!imgUrl) imgUrl = await buscarEnINaturalist(nombre);
            valid = !!imgUrl;
        }

        if (valid) {
            const separador = imgUrl.includes('?') ? '&' : '?';
            imagenAlga.src = `${imgUrl}${separador}t=${new Date().getTime()}`;
            cargando.style.display = "none";
            contenedorImagen.style.display = "inline-block";
            contenedorImagen.classList.remove('animate__fadeIn');
            void contenedorImagen.offsetWidth;
            contenedorImagen.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            cargando.style.display = "none";
            algaSeleccionada.innerHTML = `${nombre}<br><small style="color: orange">Sin imagen disponible.</small>`;
        }
    }

    function mostrarAlgaAleatoria() {
        if (allAlgaeData.length === 0) return;
        const alga = allAlgaeData[Math.floor(Math.random() * allAlgaeData.length)];
        mostrarAlga(alga.name);
    }

    function openCompareModal() { compareModal.style.display = 'block'; }

    function performGroupCompare() {
        const g1 = groupSelect1.value;
        const g2 = groupSelect2.value;
        if (!g1 || !g2) { alert("Análisis denegado. Seleccione dos grupos distintos."); return; }

        const details1 = groupDetails[g1];
        const details2 = groupDetails[g2];
        const allKeys = Array.from(new Set([...Object.keys(details1), ...Object.keys(details2)]));

        let html = `<table class="compare-table">
            <tr><th>Característica</th><th>${groupStyles[g1].emoji} ${g1}</th><th>${groupStyles[g2].emoji} ${g2}</th></tr>`;
        allKeys.forEach(key => {
            html += `<tr><td><strong>${key}</strong></td><td>${details1[key] || '-'}</td><td>${details2[key] || '-'}</td></tr>`;
        });
        html += '</table>';
        compareTableContainer.innerHTML = html;
    }

    // --- LÓGICA TÁCTICA DEL QUIZ (REESTRUCTURADA PARA CERO LATENCIA) ---
    async function openQuizModal() {
        quizModal.style.display = 'block';
        quizSetupScreen.style.display = 'none';
        quizGameScreen.style.display = 'none';
        quizResultsScreen.style.display = 'none';

        // FASE 1: Precarga y verificación de la base de datos teórica
        await updateProgress(20, 'Estableciendo conexión con el banco táctico...');
        const cargado = await cargarBancoTeoria();
        await updateProgress(100, 'Base de datos sincronizada');

        setTimeout(() => {
            hideProgress();
            if (!cargado) {
                alert("Fallo crítico: No se pudo enlazar el banco de preguntas.");
                quizModal.style.display = 'none';
                return;
            }
            showQuizSetup();
        }, 300); // Pequeño respiro visual
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
        if (mode === 'all') {
            if (quizType === 'visual') {
                await initQuizGame(allAlgaeData);
            } else {
                let totalTeoria = [];
                Object.keys(bancoTeoriaDinamico).forEach(g => {
                    totalTeoria = totalTeoria.concat(bancoTeoriaDinamico[g]);
                });
                await initQuizGame(totalTeoria);
            }
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
            if (!group) { alert("Seleccione un objetivo táctico."); return; }
            const filtered = allAlgaeData.filter(a => a.group === group);
            if (filtered.length < 4) { alert(`El grupo ${group} carece del volumen estadístico necesario (mínimo 4).`); return; }
            await initQuizGame(filtered);
        } else {
            const checkedBoxes = document.querySelectorAll('.quiz-group-checkbox:checked');
            if (checkedBoxes.length === 0) { alert("Seleccione al menos un cuadrante de estudio."); return; }

            let poolPreguntas = [];
            checkedBoxes.forEach(box => {
                const grupoSelected = box.value;
                if (bancoTeoriaDinamico[grupoSelected]) {
                    poolPreguntas = poolPreguntas.concat(bancoTeoriaDinamico[grupoSelected]);
                }
            });

            if (poolPreguntas.length === 0) { alert("No hay datos teóricos en los cuadrantes seleccionados."); return; }
            await initQuizGame(poolPreguntas);
        }
    }

    async function initQuizGame(dataset) {
        quizSetupScreen.style.display = 'none';

        quizQuestions = [];
        quizScore = 0;
        currentQuizQuestion = 0;

        // FASE 2: Estructuración y validación del arsenal antes de iniciar
        await updateProgress(10, 'Compilando arsenal de evaluación...');

        if (quizType === 'visual') {
            const validDataset = dataset.filter(a => a.img && a.img.trim() !== "");
            if (validDataset.length < 4) { 
                alert("Insuficientes imágenes válidas en el banco."); 
                hideProgress(); 
                showQuizSetup(); 
                return; 
            }

            const shuffled = [...validDataset].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(QUIZ_LENGTH, shuffled.length));

            for (let i = 0; i < selected.length; i++) {
                // Barra de progreso actualizando dinámicamente
                const percent = 10 + ((i / selected.length) * 80);
                await updateProgress(percent, `Validando telemetría visual ${i+1}/${selected.length}...`);

                const correctAlga = selected[i];
                const others = allAlgaeData.filter(a => a.name !== correctAlga.name);
                const wrong = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(a => a.name);
                const options = [correctAlga.name, ...wrong].sort(() => 0.5 - Math.random());

                quizQuestions.push({
                    image: correctAlga.img,
                    correctAnswer: correctAlga.name,
                    options: options
                });
            }
        } else {
            const shuffledQuestions = [...dataset].sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffledQuestions.slice(0, Math.min(QUIZ_LENGTH, shuffledQuestions.length));

            for (let i = 0; i < selectedQuestions.length; i++) {
                const percent = 10 + ((i / selectedQuestions.length) * 80);
                await updateProgress(percent, `Estructurando variables teóricas ${i+1}/${selectedQuestions.length}...`);

                const qData = selectedQuestions[i];
                quizQuestions.push({
                    isTheory: true,
                    questionText: qData.q,
                    correctAnswer: qData.options[qData.correct],
                    options: [...qData.options]
                });
            }
        }

        await updateProgress(100, 'Selecion de preguntas completada,Suerte.');

        setTimeout(() => {
            hideProgress();
            quizGameScreen.style.display = 'block';
            loadQuizQuestion();
        }, 400); // Respiro visual final
    }

    async function loadQuizQuestion() {
        if (currentQuizQuestion >= quizQuestions.length) {
            finishQuiz();
            return;
        }

        const q = quizQuestions[currentQuizQuestion];
        quizOptions.innerHTML = '';
        quizFeedback.textContent = '';
        quizFeedback.className = '';

        quizProgress.textContent = `Fase ${currentQuizQuestion + 1} / ${quizQuestions.length}`;
        quizScoreEl.textContent = `Puntuacion: ${quizScore}`;

        const questionTextEl = document.querySelector('.quiz-question-text');

        if (q.isTheory === true) {
            document.getElementById('quiz-image-container').style.display = 'none';
            quizImage.style.display = 'none';
            quizImage.src = ''; 
            quizSpinner.style.display = 'none';
            questionTextEl.textContent = q.questionText;
        } else {
            document.getElementById('quiz-image-container').style.display = 'flex';
            quizImage.style.display = 'none';
            quizSpinner.style.display = 'block';
            questionTextEl.textContent = 'Identifique el objetivo:';

            let imgUrl = q.image;
            let valid = imgUrl && imgUrl.trim() !== "" && imgUrl.startsWith('http');

            if (!valid) { // Si falló el filtro de la matriz primaria
                imgUrl = await buscarEnWikimediaCommons(q.correctAnswer);
                if (!imgUrl) imgUrl = await buscarEnINaturalist(q.correctAnswer);
                valid = !!imgUrl;
            }

            if (imgUrl) {
                const separador = imgUrl.includes('?') ? '&' : '?';
                quizImage.src = `${imgUrl}${separador}t=${new Date().getTime()}`;
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
            btn.onclick = (e) => checkQuizAnswer(opt, q.correctAnswer, e.target);
            quizOptions.appendChild(btn);
        });
    }

    function checkQuizAnswer(selected, correct, btnElement) {
        const btns = document.querySelectorAll('.quiz-option-btn');
        btns.forEach(b => {
            b.disabled = true;
            if (b.textContent === correct) b.classList.add('correct');
        });

        if (selected === correct) {
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

        const percentage = (quizScore / quizQuestions.length);
        if (percentage >= 0.99) quizFinalMessage.textContent = "Felicidades. Sigue asi.";
        else if (percentage >= 0.7) quizFinalMessage.textContent = "Nada mal. Puedes mejorar vamos.";
        else if (percentage >= 0.5) quizFinalMessage.textContent = "Intentalo una vez mas. No te rindas.";
        else quizFinalMessage.textContent = "Puedes mejorar. Intentalo otra vez.";
    }

    // --- INICIALIZACIÓN ---
    document.addEventListener('DOMContentLoaded', () => {
        catalogo = document.getElementById("catalogo");
        algaSeleccionada = document.getElementById("algaSeleccionada");
        detallesAlga = document.getElementById("detalles-alga");
        imagenAlga = document.getElementById("imagenAlga");
        botonImagen = document.getElementById("buscarImagen");
        contenedorImagen = document.getElementById("contenedorImagen");
        cargando = document.getElementById("cargando");
        searchInput = document.getElementById("search-input");
        modeToggle = document.getElementById("mode-toggle");
        surpriseBtn = document.getElementById("surprise-btn");

        compareGroupsBtn = document.getElementById("compare-groups-btn");
        compareModal = document.getElementById("compare-modal");
        closeCompareModal = document.getElementById("close-compare-modal");
        groupSelect1 = document.getElementById("group-select-1");
        groupSelect2 = document.getElementById("group-select-2");
        doCompareBtn = document.getElementById("do-compare-btn");
        compareTableContainer = document.getElementById("compare-table-container");

        startQuizBtn = document.getElementById("start-quiz-btn");
        quizModal = document.getElementById("quiz-modal");
        closeQuizModal = document.getElementById("close-quiz-modal");
        quizSetupScreen = document.getElementById("quiz-setup");
        quizGameScreen = document.getElementById("quiz-game");
        quizResultsScreen = document.getElementById("quiz-results");
        quizModeAllBtn = document.getElementById("quiz-mode-all");
        quizModeGroupBtn = document.getElementById("quiz-mode-group");
        quizGroupSelectionDiv = document.getElementById("quiz-group-selection");
        quizGroupDropdown = document.getElementById("quiz-group-dropdown");
        quizStartGroupBtn = document.getElementById("quiz-start-group-btn");
        quizImage = document.getElementById("quiz-image");
        quizSpinner = document.getElementById("quiz-spinner");
        quizOptions = document.getElementById("quiz-options");
        quizFeedback = document.getElementById("quiz-feedback");
        quizProgress = document.getElementById("quiz-progress");
        quizScoreEl = document.getElementById("quiz-score");
        quizFinalScoreNumber = document.getElementById("quiz-final-score-number");
        quizFinalMessage = document.getElementById("quiz-final-message");
        quizRestartBtn = document.getElementById("quiz-restart-btn");
        quizHomeBtn = document.getElementById("quiz-home-btn");

        // Asignación de variables de progreso
        quizLoadingOverlay = document.getElementById("quiz-loading-overlay");
        quizLoadingText = document.getElementById("quiz-loading-text");
        quizProgressBar = document.getElementById("quiz-progress-bar");

        window.singleGroupContainer = document.getElementById('quiz-single-group-container');
        window.multipleGroupContainer = document.getElementById('quiz-multiple-group-container');

        const typeVisualRadio = document.getElementById('type-visual-radio');
        const typeTeoriaRadio = document.getElementById('type-teoria-radio');

        cargarDatos();

        searchInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = {};
            for (const g in allAlgaeGroups) {
                const matches = allAlgaeGroups[g].filter(a => a.toLowerCase().includes(term));
                if (matches.length) filtered[g] = matches;
            }
            renderCatalogo(filtered);
        });

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

        surpriseBtn.addEventListener('click', mostrarAlgaAleatoria);
        compareGroupsBtn.addEventListener('click', openCompareModal);
        closeCompareModal.addEventListener('click', () => compareModal.style.display = 'none');
        doCompareBtn.addEventListener('click', performGroupCompare);

        startQuizBtn.addEventListener('click', openQuizModal);
        closeQuizModal.addEventListener('click', () => quizModal.style.display = 'none');
        quizModeAllBtn.addEventListener('click', () => setupQuizMode('all'));

        quizModeGroupBtn.addEventListener('click', () => {
            quizGroupSelectionDiv.style.display = 'block';
            if (quizType === 'visual') {
                singleGroupContainer.style.display = 'block';
                multipleGroupContainer.style.display = 'none';
            } else {
                singleGroupContainer.style.display = 'none';
                multipleGroupContainer.style.display = 'block';
                renderQuizCheckboxes();
            }
        });

        typeVisualRadio.addEventListener('change', () => {
            quizType = "visual";
            if (quizGroupSelectionDiv.style.display === 'block') {
                singleGroupContainer.style.display = 'block';
                multipleGroupContainer.style.display = 'none';
            }
        });

        typeTeoriaRadio.addEventListener('change', () => {
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
            m.style.display = "block";
            m.classList.add('animate__fadeIn');
        };
        window.buscarEnGoogleImages = () => {
            const n = botonImagen.dataset.nombre;
            if(n) window.open(`https://www.google.com/search?q=${encodeURIComponent(n)}+microalga&tbm=isch`, '_blank');
        };
        window.recomendarAlgas = () => {
            window.open("https://docs.google.com/forms/d/e/1FAIpQLScKt3p1B_aV5KCY2r5icR33LhkexEpVjzoRWiHY6WSa-HmXQA/viewform?usp=sharing", "_blank");
        };
    });

})();
