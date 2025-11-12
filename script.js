// Envolvemos todo el código en una IIFE para proteger el ámbito (scope)
(function() {

    // Variables globales para almacenar los datos cargados
    let allAlgaeData = [];
    let groupStyles = {};
    let groupDetails = {};
    let allAlgaeGroups = {};
    let allAlgasForSearch = []; // Lista plana para búsqueda

    // Referencias al DOM (se asignan una vez se carga el DOM)
    let catalogo;
    let algaSeleccionada;
    let detallesAlga;
    let imagenAlga;
    let botonImagen;
    let contenedorImagen;
    let cargando;
    let searchInput;
    let modeToggle;

    /**
     * Carga los datos principales desde el JSON al iniciar la página
     */
    async function cargarDatos() {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) {
                throw new Error(`Error al cargar data.json: ${response.statusText}`);
            }
            const data = await response.json();

            // Almacenar datos en variables globales
            allAlgaeData = data.algae;
            groupStyles = data.groupStyles;
            groupDetails = data.groupDetails;

            // Procesar los datos para construir el catálogo
            allAlgaeData.forEach(alga => {
                if (!allAlgaeGroups[alga.group]) {
                    allAlgaeGroups[alga.group] = [];
                }
                allAlgaeGroups[alga.group].push(alga.name);
                allAlgasForSearch.push({ name: alga.name, group: alga.group });
            });

            // Ordenar alfabéticamente los grupos y las algas dentro de ellos
            const orderedGroups = {};
            Object.keys(allAlgaeGroups).sort().forEach(groupName => {
                orderedGroups[groupName] = allAlgaeGroups[groupName].sort();
            });
            allAlgaeGroups = orderedGroups;

            // ¡Renderizar el catálogo!
            renderCatalogo(allAlgaeGroups);

        } catch (error) {
            console.error("Error fatal al cargar los datos de algas:", error);
            catalogo.innerHTML = `<p class="search-no-results" style="text-align:center;">Error al cargar el catálogo de algas.</p>`;
        }
    }

    /**
     * Muestra la imagen de la microalga en el contenedor de resultados.
     */
    function mostrarImagen(url, altText) {
        imagenAlga.src = url;
        imagenAlga.alt = altText;
        cargando.style.display = "none";
        contenedorImagen.style.display = "inline-block";
        contenedorImagen.classList.remove('animate__fadeIn');
        void contenedorImagen.offsetWidth; // Trigger reflow
        contenedorImagen.classList.add('animate__animated', 'animate__fadeIn');
    }

    /**
     * Verifica si una imagen se puede cargar correctamente.
     */
    function verificarImagen(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    /**
     * Busca una imagen en Wikimedia Commons utilizando la API de MediaWiki.
     */
    async function buscarEnWikimediaCommons(nombre) {
        try {
            const queries = [`${nombre} microalga`, `${nombre} algae`, `${nombre} phytoplankton`];

            for (const query of queries) {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=3&srprop=titlesnippet&origin=*`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.query && data.query.search && data.query.search.length > 0) {
                    for (const resultado of data.query.search) {
                        const archivo = resultado.title.replace('File:', '');
                        const imagenUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(archivo)}`;
                        if (await verificarImagen(imagenUrl)) {
                            return imagenUrl;
                        }
                    }
                }
            }
        } catch (error) {
            console.log("Error buscando en Wikimedia Commons:", error);
        }
        return null;
    }

    /**
     * Busca una imagen en iNaturalist Ecuador utilizando su API.
     */
    async function buscarEnINaturalist(nombre) {
        try {
            const queries = [
                nombre.toLowerCase(),
                `${nombre.toLowerCase()} algae`,
                `${nombre.toLowerCase()} microalgae`,
                `${nombre.toLowerCase()} phytoplankton`
            ];

            for (const query of queries) {
                try {
                    const url = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(query)}&place_id=7509&photos=true&per_page=5&quality_grade=research`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        for (const observation of data.results) {
                            if (observation.photos && observation.photos.length > 0) {
                                const foto = observation.photos[0];
                                const imagenUrl = foto.url.replace('square', 'original');
                                if (await verificarImagen(imagenUrl)) {
                                    return imagenUrl;
                                }
                            }
                        }
                    }
                } catch (innerError) {
                    console.warn(`Error al buscar "${query}" en iNaturalist:`, innerError);
                }
            }
        } catch (error) {
            console.log("Error general en la búsqueda de iNaturalist:", error);
        }
        return null;
    }

    /**
     * Intenta encontrar una imagen para la microalga, buscando en la web si no está en el JSON.
     */
    async function buscarImagenFallback(nombre) {
        try {
            const imagenWiki = await buscarEnWikimediaCommons(nombre);
            if (imagenWiki) {
                const esValida = await verificarImagen(imagenWiki);
                if (esValida) {
                    mostrarImagen(imagenWiki, `${nombre} - Wikimedia Commons`);
                    return;
                } else {
                    console.warn(`La imagen de Wikimedia para ${nombre} no cargó o no es válida: ${imagenWiki}`);
                }
            }

            const imagenINaturalist = await buscarEnINaturalist(nombre);
            if (imagenINaturalist) {
                const esValida = await verificarImagen(imagenINaturalist);
                if (esValida) {
                    mostrarImagen(imagenINaturalist, `${nombre} - iNaturalist Ecuador`);
                    return;
                } else {
                    console.warn(`La imagen de iNaturalist para ${nombre} no cargó o no es válida: ${imagenINaturalist}`);
                }
            }

            // Si fallan todas las búsquedas
            cargando.style.display = "none";
            contenedorImagen.style.display = "none";
            algaSeleccionada.innerHTML = `${nombre}<br><small style="color: #ffcc00; font-size: 0.8em;">No se encontró imagen disponible. Haz clic en 'Buscar en Google Imágenes' para explorar más.</small>`;

        } catch (error) {
            console.error("Error general en la búsqueda automática de imagen:", error);
            cargando.style.display = "none";
            algaSeleccionada.innerHTML = `${nombre}<br><small style="color: #ffcc00; font-size: 0.8em;">Error al buscar imagen.</small>`;
        }
    }


    /**
     * Renderiza el catálogo de microalgas.
     */
    function renderCatalogo(filteredGrupos) {
        catalogo.innerHTML = ''; // Limpiar catálogo existente
        allAlgasForSearch = []; // Resetear la lista para el buscador

        for (const grupoName in filteredGrupos) {
            const divGrupo = document.createElement("div");
            divGrupo.className = "grupo animate__animated animate__fadeInUp";
            divGrupo.setAttribute("role", "group");
            divGrupo.setAttribute("aria-labelledby", `grupo-${grupoName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`);

            const h2 = document.createElement("h2");
            const groupStyle = groupStyles[grupoName];
            h2.innerHTML = `${groupStyle.emoji} ${grupoName}`; // Añadir emoji
            h2.style.backgroundColor = groupStyle.color; // Color de fondo único
            h2.id = `grupo-${grupoName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
            h2.onclick = () => toggleAccordion(divGrupo);
            h2.setAttribute("tabindex", "0");
            h2.setAttribute("aria-expanded", "false");
            h2.setAttribute("aria-controls", `list-${grupoName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`);
            h2.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleAccordion(divGrupo);
                }
            });
            divGrupo.appendChild(h2);

            const ul = document.createElement("ul");
            ul.id = `list-${grupoName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
            ul.setAttribute("role", "list");
            ul.setAttribute("aria-hidden", "true");

            filteredGrupos[grupoName].forEach(nombre => {
                const li = document.createElement("li");
                li.textContent = nombre;
                li.onclick = () => mostrarAlga(nombre);
                li.setAttribute("role", "listitem");
                li.setAttribute("tabindex", "0");
                li.setAttribute("aria-label", `Seleccionar ${nombre}`);
                li.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        mostrarAlga(nombre);
                    }
                });
                ul.appendChild(li);
                // Volver a poblar allAlgasForSearch con los elementos li renderizados
                allAlgasForSearch.push({ name: nombre, group: grupoName, element: li });
            });
            divGrupo.appendChild(ul);
            catalogo.appendChild(divGrupo);
        }
    }

    /**
     * Abre/cierra el acordeón de un grupo.
     */
    function toggleAccordion(divGrupo) {
        const ul = divGrupo.querySelector('ul');
        const h2 = divGrupo.querySelector('h2');
        const isActive = divGrupo.classList.contains('active');

        // Cerrar todos los demás acordeones
        document.querySelectorAll('.grupo.active').forEach(openGrupo => {
            if (openGrupo !== divGrupo) {
                openGrupo.classList.remove('active');
                openGrupo.querySelector('ul').style.maxHeight = null;
                openGrupo.querySelector('ul').setAttribute('aria-hidden', 'true');
                openGrupo.querySelector('h2').setAttribute('aria-expanded', 'false');
            }
        });

        if (isActive) {
            divGrupo.classList.remove('active');
            ul.style.maxHeight = null;
            h2.setAttribute("aria-expanded", "false");
            ul.setAttribute("aria-hidden", "true");
        } else {
            divGrupo.classList.add('active');
            ul.style.maxHeight = "2000px"; 
            h2.setAttribute("aria-expanded", "true");
            ul.setAttribute("aria-hidden", "false");
        }
    }

    /**
     * Muestra la información de una microalga seleccionada y busca su imagen.
     */
    async function mostrarAlga(nombre) {
        // Mover la vista al contenedor de resultados
        document.getElementById("result").scrollIntoView({ behavior: 'smooth', block: 'start' });

        algaSeleccionada.textContent = nombre;
        contenedorImagen.style.display = "none";
        cargando.style.display = "flex";
        botonImagen.style.display = "inline-block";
        botonImagen.dataset.nombre = nombre;
        localStorage.setItem('ultimaAlgaSeleccionada', nombre);

        const algaData = allAlgaeData.find(a => a.name === nombre);
        const grupo = algaData ? algaData.group : null;

        // OBTENER Y MOSTRAR DETALLES BIOLÓGICOS DEL GRUPO
        if (grupo && groupDetails[grupo]) {
            // Asignar el color del grupo como variable CSS
            const colorDelGrupo = groupStyles[grupo] ? groupStyles[grupo].color : 'var(--button-bg-light)';
            detallesAlga.style.setProperty('--group-color', colorDelGrupo);

            const detalles = groupDetails[grupo];
            let htmlContent = `<h3>Detalles Clave del Grupo: ${grupo}</h3><dl>`;

            for (const key in detalles) {
                let detalleTexto = detalles[key];
                // Convierte **texto** en <strong>texto</strong>
                let textoProcesado = detalleTexto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                htmlContent += `<dt>${key}</dt><dd>${textoProcesado}</dd>`;
            }
            htmlContent += `</dl>`;
            detallesAlga.innerHTML = htmlContent;
            detallesAlga.style.display = "block";
            detallesAlga.classList.remove('animate__fadeIn');
            void detallesAlga.offsetWidth; // Trigger reflow
            detallesAlga.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            detallesAlga.style.display = "none";
            detallesAlga.innerHTML = '';
        }

        // Resaltar la alga seleccionada
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        const selectedLi = allAlgasForSearch.find(alga => alga.name === nombre)?.element;
        if (selectedLi) {
            selectedLi.classList.add('highlight');
            const parentGrupo = selectedLi.closest('.grupo');
            if (parentGrupo && !parentGrupo.classList.contains('active')) {
                toggleAccordion(parentGrupo);
            }
            selectedLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Lógica de búsqueda de imagen
        if (algaData && algaData.img) {
            // Usar la imagen específica del JSON si existe
            const esValida = await verificarImagen(algaData.img);
            if (esValida) {
                mostrarImagen(algaData.img, `${nombre} - Vista microscópica`);
            } else {
                console.warn(`Imagen específica para ${nombre} no cargó. Buscando fallback...`);
                await buscarImagenFallback(nombre); // Buscar en la web si la imagen del JSON falla
            }
        } else {
            // Si no hay imagen en el JSON, buscar en la web
            await buscarImagenFallback(nombre);
        }
    }


    // Abre el modal de pantalla completa
    window.abrirPantallaCompleta = function() {
        const modal = document.getElementById("modalImagen");
        const imagenModal = document.getElementById("imagenModal");
        imagenModal.src = imagenAlga.src;
        imagenModal.alt = imagenAlga.alt;
        modal.style.display = "block";
        modal.classList.add('animate__animated', 'animate__fadeIn');
        document.body.style.overflow = 'hidden';
    }

    // Cierra el modal de pantalla completa
    window.cerrarModal = function() {
        const modal = document.getElementById("modalImagen");
        modal.classList.remove('animate__fadeIn');
        modal.classList.add('animate__animated', 'animate__fadeOut');
        modal.addEventListener('animationend', function handler() {
            modal.style.display = "none";
            modal.classList.remove('animate__fadeOut');
            modal.removeEventListener('animationend', handler);
            document.body.style.overflow = '';
        });
    }

    // Busca la microalga en Google Images
    window.buscarEnGoogleImages = function() {
        const nombre = botonImagen.dataset.nombre;
        if (nombre) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(nombre)}+microalga&tbm=isch`, '_blank');
        }
    }

    // Función para redirigir al formulario de recomendación
    window.recomendarAlgas = function() {
        window.open("https://docs.google.com/forms/d/e/1FAIpQLScKt3p1B_aV5KCY2r5icR33LhkexEpVjzoRWiHY6WSa-HmXQA/viewform?usp=sharing&ouid=105505351182673319030", "_blank");
    }

    // Lógica del buscador
    function setupSearchListener() {
        searchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const filteredGrupos = {};

            // Filtrar desde la lista maestra 'allAlgaeGroups'
            for (const grupoName in allAlgaeGroups) {
                const matchingAlgas = allAlgaeGroups[grupoName].filter(alga =>
                    alga.toLowerCase().includes(searchTerm)
                );
                if (matchingAlgas.length > 0) {
                    filteredGrupos[grupoName] = matchingAlgas;
                }
            }

            renderCatalogo(filteredGrupos);

            // Mostrar mensaje si no hay resultados
            if (Object.keys(filteredGrupos).length === 0 && searchTerm.length > 0) {
                catalogo.innerHTML = `<p class="search-no-results">No se encontraron algas con el nombre "<strong>${searchTerm}</strong>".</p>`;
            }

            // Expandir grupos y resaltar en la búsqueda
            if (searchTerm.length > 0) {
                document.querySelectorAll('.grupo').forEach(groupDiv => {
                    const ul = groupDiv.querySelector('ul');
                    // Abrir acordeones que tienen resultados
                    if (ul.children.length > 0) {
                        groupDiv.classList.add('active');
                        ul.style.maxHeight = "2000px";
                        groupDiv.querySelector('h2').setAttribute("aria-expanded", "true");
                        ul.setAttribute("aria-hidden", "false");
                    } else {
                        groupDiv.classList.remove('active');
                        ul.style.maxHeight = null;
                        groupDiv.querySelector('h2').setAttribute("aria-expanded", "false");
                        ul.setAttribute("aria-hidden", "true");
                    }

                    // Resaltar texto
                    groupDiv.querySelectorAll('li').forEach(li => {
                        if (li.textContent.toLowerCase().includes(searchTerm)) {
                            li.classList.add('search-highlight');
                        } else {
                            li.classList.remove('search-highlight');
                        }
                    });
                });
            } else {
                // Colapsar todos si la búsqueda está vacía
                document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
                document.querySelectorAll('.grupo.active').forEach(groupDiv => {
                    groupDiv.classList.remove('active');
                    groupDiv.querySelector('ul').style.maxHeight = null;
                    groupDiv.querySelector('h2').setAttribute("aria-expanded", "false");
                    groupDiv.querySelector('ul').setAttribute("aria-hidden", "true");
                });
            }
        });
    }

    // Lógica de modo oscuro
    function setupModeToggle() {
        modeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            modeToggle.textContent = isDarkMode ? '☀️' : '🌙';
            modeToggle.setAttribute('aria-label', isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        });
    }

    // Cargar todo cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        // Asignar elementos del DOM a las variables
        catalogo = document.getElementById("catalogo");
        algaSeleccionada = document.getElementById("algaSeleccionada");
        detallesAlga = document.getElementById("detalles-alga");
        imagenAlga = document.getElementById("imagenAlga");
        botonImagen = document.getElementById("buscarImagen");
        contenedorImagen = document.getElementById("contenedorImagen");
        cargando = document.getElementById("cargando");
        searchInput = document.getElementById("search-input");
        modeToggle = document.getElementById("mode-toggle");

        // Cargar preferencia de modo oscuro
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
            modeToggle.textContent = '☀️';
            modeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
        } else {
            modeToggle.textContent = '🌙';
            modeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
        }

        // Iniciar la carga de datos y configuración
        cargarDatos();
        setupSearchListener();
        setupModeToggle();
    });

})(); // Fin de la IIFE
