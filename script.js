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

    let quizQuestions = [];
    let currentQuizQuestion = 0;
    let quizScore = 0;
    const QUIZ_LENGTH = 10;

    let quizType = "visual"; 
    let bancoTeoriaDinamico = null;

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
            console.error("Error al cargar el banco de preguntas teóricas:", error);
            alert("No se pudo cargar el cuestionario de teoría.");
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

    function openCompareModal() {
        compareModal.style.display = 'block';
    }

    function performGroupCompare() {
        const g1 = groupSelect1.value;
        const g2 = groupSelect2.value;

        if (!g1 || !g2) {
            alert("Por favor selecciona dos grupos diferentes.");
            return;
        }

        const details1 = groupDetails[g1];
        const details2 = groupDetails[g2];
        const allKeys = Array.from(new Set([...Object.keys(details1), ...Object.keys(details2)]));

        let html = `<table class="compare-table">
            <tr>
                <th>Característica</th>
                <th>${groupStyles[g1].emoji} ${g1}</th>
                <th>${groupStyles[g2].emoji} ${g2}</th>
            </tr>`;

        allKeys.forEach(key => {
            html += `<tr>
                <td><strong>${key}</strong></td>
                <td>${details1[key] || '-'}</td>
                <td>${details2[key] || '-'}</td>
            </tr>`;
        });

        html += '</table>';
        compareTableContainer.innerHTML = html;
    }

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
        if (quizType === 'teoria') {
            const cargado = await cargarBancoTeoria();
            if (!cargado) return;
        }

        if (mode === 'all') {
            if (quizType === 'visual') {
                initQuizGame(allAlgaeData);
            } else {
                let totalTeoria = [];
                Object.keys(bancoTeoriaDinamico).forEach(g => {
                    totalTeoria = totalTeoria.concat(bancoTeoriaDinamico[g]);
                });
                initQuizGame(totalTeoria);
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

    // BLINDAJE TÁCTICO: Sincronización estricta de base de datos
    async function startGroupQuiz() {
        if (quizType === 'visual') {
            const group = quizGroupDropdown.value;
            if (!group) { alert("Selecciona un grupo"); return; }
            const filtered = allAlgaeData.filter(a => a.group === group);
            if (filtered.length < 4) { alert(`El grupo ${group} tiene muy pocas algas para un quiz visual.`); return; }
            initQuizGame(filtered);
        } else {
            const cargado = await cargarBancoTeoria();
            if (!cargado) return;

            const checkedBoxes = document.querySelectorAll('.quiz-group-checkbox:checked');
            if (checkedBoxes.length === 0) { alert("Selecciona al menos un grupo para estudiar teoría."); return; }
            
            let poolPreguntas = [];
            checkedBoxes.forEach(box => {
                const grupoSelected = box.value;
                if (bancoTeoriaDinamico[grupoSelected]) {
                    poolPreguntas = poolPreguntas.concat(bancoTeoriaDinamico[grupoSelected]);
                }
            });
            
            if (poolPreguntas.length === 0) { alert("No hay preguntas teóricas disponibles para los grupos seleccionados."); return; }
            initQuizGame(poolPreguntas);
        }
    }

    function initQuizGame(dataset) {
        quizQuestions = [];
        quizScore = 0;
        currentQuizQuestion = 0;

        if (quizType === 'visual') {
            const validDataset = dataset.filter(a => a.img && a.img.trim() !== "");
            if (validDataset.length < 4) { alert("No hay suficientes imágenes válidas."); return; }
            const shuffled = [...validDataset].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(QUIZ_LENGTH, shuffled.length));

            selected.forEach(correctAlga => {
                const others = allAlgaeData.filter(a => a.name !== correctAlga.name);
                const wrong = others.sort(() => 0.5 - Math.random()).slice(0, 3).map(a => a.name);
                const options = [correctAlga.name, ...wrong].sort(() => 0.5 - Math.random());

                quizQuestions.push({
                    image: correctAlga.img,
                    correctAnswer: correctAlga.name,
                    options: options
                });
            });
        } else {
            const shuffledQuestions = [...dataset].sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffledQuestions.slice(0, Math.min(QUIZ_LENGTH, shuffledQuestions.length));
            
            selectedQuestions.forEach(qData => {
                quizQuestions.push({
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
        if (currentQuizQuestion >= quizQuestions.length) {
            finishQuiz();
            return;
        }

        const q = quizQuestions[currentQuizQuestion];
        quizOptions.innerHTML = '';
        quizFeedback.textContent = '';
        quizFeedback.className = '';
        
        quizProgress.textContent = `Pregunta ${currentQuizQuestion + 1} / ${quizQuestions.length}`;
        quizScoreEl.textContent = `Puntos: ${quizScore}`;

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
            questionTextEl.textContent = '¿Qué alga es esta?';

            let imgUrl = q.image;
            let valid = imgUrl && imgUrl.trim() !== "" && imgUrl.startsWith('http');

            if (!valid) {
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
            quizFeedback.textContent = "👍";
            quizFeedback.className = 'correct';
        } else {
            btnElement.classList.add('wrong');
            quizFeedback.textContent = "👎";
            quizFeedback.className = 'wrong';
        }

        setTimeout(() => {
            currentQuizQuestion++;
            loadQuizQuestion();
        }, 1500);
    }

    function finishQuiz() {
        quizGameScreen.style.display = 'none';
        quizResultsScreen.style.display = 'block';
        quizFinalScoreNumber.textContent = quizScore;

        const percentage = (quizScore / quizQuestions.length);
        if (percentage === 1) quizFinalMessage.textContent = "¡Perfecto! 🌟 Eres un experto.";
        else if (percentage >= 0.7) quizFinalMessage.textContent = "¡Muy bien! 👏 Casi perfecto.";
        else if (percentage >= 0.5) quizFinalMessage.textContent = "Bien, pero puedes mejorar. 📚";
        else quizFinalMessage.textContent = "Sigue practicando. 💪";
    }

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
        
        // BLINDAJE TÁCTICO: Validaciones de carga en eventos
        quizModeGroupBtn.addEventListener('click', async () => {
            quizGroupSelectionDiv.style.display = 'block';
            if (quizType === 'visual') {
                singleGroupContainer.style.display = 'block';
                multipleGroupContainer.style.display = 'none';
            } else {
                singleGroupContainer.style.display = 'none';
                multipleGroupContainer.style.display = 'block';
                await cargarBancoTeoria();
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

        typeTeoriaRadio.addEventListener('change', async () => {
            quizType = "teoria";
            if (quizGroupSelectionDiv.style.display === 'block') {
                singleGroupContainer.style.display = 'none';
                multipleGroupContainer.style.display = 'block';
                await cargarBancoTeoria();
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
