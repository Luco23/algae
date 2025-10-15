// Define los grupos de microalgas originales
const gruposOriginales = {
    "Cianofitas": [
        "Spirulina", "Oscillatoria", "Merismopedia", "Rivularia", "Nostoc",
        "Anabaena", "Microcystis", "Lyngbya", "Micrasterias"
    ],
    "Diatomeas": [
        "Skeletonema", "Chaetocero", "Rhizosolenia", "Biddulphia", "Thalassiosira",
        "Coscinodiscus", "Pleurosigma", "Gyrosigma", "Ditylum", "Navícula",
        "Pinnularia", "Asterionella", "Tabellaría"
    ],
    "Dinoflagelados": [
        "Ceratium", "Dinophysis", "Noctiluca", "Peridinium", "Gymnodinium"
    ],
    "Clorofitas": [
        "Tetraselmis", "Dunaliella", "Chlorella", "Pediastrum",
        "Closterium", "Cosmarium", "Ankistrodesmus", "Scenedesmus", "Volvox",
        "Spirogyra", "Oedogonium", "Zygnema", "Ulva", "Codium"
    ],
    "Euglenofitas": [
        "Euglena", "Phacus", "Paranema"
    ],
    "Feofitas": [
        "Padina", "Sargassum"
    ],
    "Rodofitas": [
        "Corallina"
    ]
};

// Define los grupos de microalgas extras
const gruposExtra = {
    "Cianofitas (Extra)": [
        "Nodularia", "Arthrospira", "Aphanizomenom", "Cylindrospermun", "Gloeocapsa",
        "Anacystis"
    ],
    "Diatomeas (Extra)": [
        "Melosira", "Bacteriastrum", "Lithodesmium", "Triceratium", "Thalassiothrix",
        "Nitzchia", "Surilella", "Diploneis", "Amphora", "Dictyocha", "Meridion",
        "Gompkonema", "Fragilaria"
    ],
    "Euglenofitas (Extra)": [
        "Astasia"
    ],
    "Clorofitas (Extra)": [
        "Pandorina", "Gonium", "Staurastrum", "Chlamydomonas", "Nitella", "Caulerpa",
        "Enteromorpha", "Ulothrix", "Chaetomorpha", "Rhizoclonium", "Halimeda",
        "Euastrium", "Palmella", "Coelastrum", "Chlorococcum", "Hidrodictium"
    ],
    "Feofitas (Extra)": [
        "Laminaria", "Undaria", "Colpomenia", "Dicyota"
    ],
    "Rodofitas (Extra)": [
        "Gracilaria", "Gigartina", "Chondrus", "Kappaphycus"
    ]
};

// Unificar grupos y eliminar duplicados
const grupos = {};
function getOriginalGroupName(extraGroupName) {
    return extraGroupName.replace(' (Extra)', '');
}

for (const grupoName in gruposOriginales) {
    grupos[grupoName] = [...gruposOriginales[grupoName]];
}

for (const grupoExtraName in gruposExtra) {
    const originalGroupName = getOriginalGroupName(grupoExtraName);
    if (grupos[originalGroupName]) {
        // Concatenar y eliminar duplicados
        grupos[originalGroupName] = grupos[originalGroupName].concat(gruposExtra[grupoExtraName]);
    } else {
        grupos[originalGroupName] = [...gruposExtra[grupoExtraName]];
    }
}

for (const grupoName in grupos) {
    // Eliminar duplicados y ordenar
    grupos[grupoName] = [...new Set(grupos[grupoName])].sort(); 
}

// Estilos y emojis para cada grupo
const groupStyles = {
    "Cianofitas": { color: "#66BB6A", emoji: "🌿" },
    "Diatomeas": { color: "#FFD54F", emoji: "🔬" },
    "Dinoflagelados": { color: "#BA68C8", emoji: "✨" },
    "Clorofitas": { color: "#4FC3F7", emoji: "💧" },
    "Euglenofitas": { color: "#FF8A65", emoji: "🦠" },
    "Feofitas": { color: "#A1887F", emoji: "🍂" },
    "Rodofitas": { color: "#F06292", emoji: "🌸" } 
};

// OBJETO: Detalles biológicos por grupo (proporcionado por el usuario)
const detallesGrupo = {
    "Cianofitas": {
        "Tipo Celular / Reino": "Procariota (Cianobacterias)",
        "Pigmentos Clave": "Clorofila A, Ficobilinas (ficocianina, ficoeritrina)",
        "Pared Celular / Cubierta": "Peptidoglucano (como en bacterias) y vaina de mucílago.",
        "Almacenamiento de Reserva": "Almidón de Cianofíceas (Glucógeno)",
        "Características Distintivas": "No se mueven por flagelos (algunas por oscilación). Pueden tener Heterocitos (fijan N) y Acinetos (células de resistencia). Realizan fotosíntesis oxigénica.",
        "Importancia en Acuicultura": "Biofertilizantes (fijación de N). Riesgo de Toxinas (FANs) letales.",
    },
    "Diatomeas": {
        "Tipo Celular / Reino": "Eucariota (Protista, Heterokontophyta)",
        "Pigmentos Clave": "Clorofila A y C, Fucoxantina (dominante)",
        "Pared Celular / Cubierta": "Frústula de Sílice (Vidrio) con ornamentaciones.",
        "Almacenamiento de Reserva": "Crisolaminarina y Aceites",
        "Características Distintivas": "Únicas con pared de sílice (vidrio). Reproducción sexual y asexual. Son los productores primarios más importantes del océano.",
        "Importancia en Acuicultura": "Alimento clave para larvas de moluscos y camarones.",
    },
    "Dinoflagelados": {
        "Tipo Celular / Reino": "Eucariota (Protista, Dinophyta)",
        "Pigmentos Clave": "Clorofila A y C, Peridinina (dominante)",
        "Pared Celular / Cubierta": "Teca de placas de celulosa (armadura) o desnudos.",
        "Almacenamiento de Reserva": "Almidón y Aceites",
        "Características Distintivas": "Dos Flagelos: uno transversal y otro longitudinal (movimiento giratorio). Pueden ser Bioluminiscentes.",
        "Importancia en Acuicultura": "Doble rol: Alimento para larvas. Causan Mareas Rojas y liberan Toxinas potentes (ej. Saxitoxinas).",
    },
    "Euglenofitas": {
        "Tipo Celular / Reino": "Eucariota (Protista, Euglenophyta)",
        "Pigmentos Clave": "Clorofila A y B, Beta-caroteno",
        "Pared Celular / Cubierta": "Carecen de pared celular. Tienen una Película proteica flexible.",
        "Almacenamiento de Reserva": "Paramilón",
        "Características Distintivas": "Combinan características de plantas y animales. Unicelulares con 1 o 2 flagelos. Viven en agua dulce con alta materia orgánica.",
        "Importancia en Acuicultura": "Indicadores de contaminación. Potencial en biomasa (crecimiento mixotrófico).",
    },
    "Clorofitas": {
        "Tipo Celular / Reino": "Eucariota (Algas Verdes)",
        "Pigmentos Clave": "Clorofila A y B (misma que plantas terrestres), Carotenos",
        "Pared Celular / Cubierta": "Celulosa (estructura rígida).",
        "Almacenamiento de Reserva": "Almidón (similar al de plantas)",
        "Características Distintivas": "Gran diversidad morfológica (uni, filamentosas, coloniales, macroalgas). Comparten ancestro común con plantas terrestres.",
        "Importancia en Acuicultura": "Fuente de Alimento Larval (Chlorella, Tetraselmis). Causan Eutrofización (hipoxia al morir).",
    },
    "Feofitas": {
        "Tipo Celular / Reino": "Eucariota (Protista, Heterokontophyta)",
        "Pigmentos Clave": "Clorofila A y C, Fucoxantina (domina y da el color pardo)",
        "Pared Celular / Cubierta": "Celulosa + Alginato (ácido algínico).",
        "Almacenamiento de Reserva": "Laminarina y Aceites",
        "Características Distintivas": "Macroalgas pluricelulares (las más grandes, como el Kelp). Estructuras de flotación (Neumatocistos). Carecen de tejidos vasculares.",
        "Importancia en Acuicultura": "Valor industrial por el Alginato (espesante/gelificante). Cultivo de especies comestibles (Wakame).",
    },
    "Rodofitas": {
        "Tipo Celular / Reino": "Eucariota (Algas Rojas)",
        "Pigmentos Clave": "Clorofila A, Ficoeritrina (domina y da el color rojo) y Ficocianina",
        "Pared Celular / Cubierta": "Celulosa + Agar y Carragenina (Ficocoloides).",
        "Almacenamiento de Reserva": "Almidón de Florídeas",
        "Características Distintivas": "Ausencia total de flagelos. Pueden vivir a mayores profundidades (por Ficoeritrina). Incluyen algas coralinas.",
        "Importancia en Acuicultura": "Extrema importancia por el Agar y la Carragenina (cultivo industrial de Gracilaria, Porphyra).",
    }
};

// Obtiene referencias a los elementos del DOM
const catalogo = document.getElementById("catalogo");
const algaSeleccionada = document.getElementById("algaSeleccionada");
const detallesAlga = document.getElementById("detalles-alga");
const imagenAlga = document.getElementById("imagenAlga");
const botonImagen = document.getElementById("buscarImagen");
const contenedorImagen = document.getElementById("contenedorImagen");
const cargando = document.getElementById("cargando");
const searchInput = document.getElementById("search-input");
const modeToggle = document.getElementById("mode-toggle");

let allAlgas = []; 

// NUEVA FUNCIÓN: Busca a qué grupo pertenece una microalga por su nombre
function obtenerGrupoDeAlga(nombreAlga) {
    for (const grupoName in grupos) {
        if (grupos[grupoName].includes(nombreAlga)) {
            return grupoName;
        }
    }
    return null;
}

/**
 * Muestra la imagen de la microalga en el contenedor de resultados.
 * @param {string} url - La URL de la imagen.
 * @param {string} altText - Texto alternativo para la imagen.
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
 * Genera la ruta local de la imagen para la microalga, asumiendo que 
 * las imágenes están en la carpeta 'images/' y son archivos .jpg.
 * @param {string} nombre - El nombre de la microalga.
 * @returns {string} La ruta local esperada.
 */
function obtenerImagenLocal(nombre) {
    // Estandariza el nombre a minúsculas y elimina caracteres no deseados
    // para formar un nombre de archivo simple y coherente (ej: Spirulina -> spirulina.jpg)
    const fileName = nombre.toLowerCase().replace(/[^a-z0-9]/g, ''); 
    return `images/${fileName}.jpg`;
}

/**
 * Intenta cargar la imagen para la microalga desde la ruta local.
 * Se ha eliminado la lógica de búsqueda en línea (Wikimedia, iNaturalist, etc.).
 */
async function buscarImagenAutomatica(nombre) {
    // 1. Oculta el contenedor mientras se actualiza
    contenedorImagen.style.display = "none";
    cargando.style.display = "flex";
    
    // 2. Obtiene la ruta local
    const rutaLocal = obtenerImagenLocal(nombre);

    // 3. Muestra la imagen. El atributo onerror del <img> en el HTML 
    //    se encargará de mostrar el placeholder si el archivo local no existe.
    mostrarImagen(rutaLocal, `Imagen local de la microalga ${nombre}`);
    
    // 4. Se asegura de que el nombre esté correcto en el H2 
    algaSeleccionada.textContent = nombre;
}


/**
 * Renderiza el catálogo de microalgas.
 * @param {Object} filteredGrupos - Los grupos de algas a mostrar.
 */
function renderCatalogo(filteredGrupos) {
    catalogo.innerHTML = '';
    allAlgas = []; 

    for (const grupoName in filteredGrupos) {
        const divGrupo = document.createElement("div");
        divGrupo.className = "grupo animate__animated animate__fadeInUp";
        divGrupo.setAttribute("role", "group");
        divGrupo.setAttribute("aria-labelledby", `grupo-${grupoName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`);

        const h2 = document.createElement("h2");
        const groupStyle = groupStyles[grupoName];
        h2.innerHTML = `${groupStyle.emoji} ${grupoName}`;
        h2.style.backgroundColor = groupStyle.color;
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
            allAlgas.push({ name: nombre, group: grupoName, element: li });
        });
        divGrupo.appendChild(ul);
        catalogo.appendChild(divGrupo);
    }
}

/**
 * Abre/cierra el acordeón de un grupo.
 * @param {HTMLElement} divGrupo - El elemento div del grupo.
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
        // Forzar un max-height muy grande para asegurar que todo el contenido sea visible y desplazable
        ul.style.maxHeight = "2000px"; 
        h2.setAttribute("aria-expanded", "true");
        ul.setAttribute("aria-hidden", "false");
    }
}

/**
 * Muestra la información de una microalga seleccionada y busca su imagen.
 * @param {string} nombre - El nombre de la microalga a mostrar.
 */
async function mostrarAlga(nombre) {
    algaSeleccionada.textContent = nombre;
    contenedorImagen.style.display = "none";
    cargando.style.display = "flex";
    botonImagen.style.display = "inline-block";
    botonImagen.dataset.nombre = nombre;
    localStorage.setItem('ultimaAlgaSeleccionada', nombre);

    // OBTENER Y MOSTRAR DETALLES BIOLÓGICOS DEL GRUPO
    const grupo = obtenerGrupoDeAlga(nombre);
    if (grupo && detallesGrupo[grupo]) {
        const detalles = detallesGrupo[grupo];
        let htmlContent = `<h3>Detalles Clave del Grupo: ${grupo}</h3><dl>`;
        for (const key in detalles) {
            // Usamos <dt> (término) para la clave y <dd> (definición) para el valor
            htmlContent += `<dt>${key}</dt><dd>${detalles[key]}</dd>`;
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

    // Desactivar el highlight anterior
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

    // Resaltar la alga seleccionada
    const selectedLi = allAlgas.find(alga => alga.name === nombre)?.element;
    if (selectedLi) {
        selectedLi.classList.add('highlight');
        // Asegurarse de que el grupo esté abierto y el elemento sea visible
        const parentUl = selectedLi.closest('ul');
        const parentGrupo = selectedLi.closest('.grupo');
        if (parentGrupo && !parentGrupo.classList.contains('active')) {
            toggleAccordion(parentGrupo);
        }
        selectedLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Carga la imagen desde la carpeta local (el resto de la lógica de búsqueda en línea fue eliminada)
    await buscarImagenAutomatica(nombre);
}


// Abre el modal de pantalla completa
function abrirPantallaCompleta() {
    const modal = document.getElementById("modalImagen");
    const imagenModal = document.getElementById("imagenModal");
    imagenModal.src = imagenAlga.src;
    imagenModal.alt = imagenAlga.alt;
    modal.style.display = "block";
    modal.classList.add('animate__animated', 'animate__fadeIn');
    document.body.style.overflow = 'hidden';
}

// Cierra el modal de pantalla completa
function cerrarModal() {
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

// Busca la microalga en Google Images (esta función se mantiene para búsqueda manual)
function buscarEnGoogleImages() {
    const nombre = botonImagen.dataset.nombre;
    if (nombre) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(nombre)}+microalga&tbm=isch`, '_blank');
    }
}

// Función para redirigir al formulario de recomendación
function recomendarAlgas() {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScKt3p1B_aV5KCY2r5icR33LhkexEpVjzoRWiHY6WSa-HmXQA/viewform?usp=sharing&ouid=105505351182673319030", "_blank");
}

// Lógica del buscador
searchInput.addEventListener('keyup', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredGrupos = {};

    for (const grupoName in grupos) {
        const matchingAlgas = grupos[grupoName].filter(alga =>
            alga.toLowerCase().includes(searchTerm)
        );
        if (matchingAlgas.length > 0) {
            filteredGrupos[grupoName] = matchingAlgas;
        }
    }

    renderCatalogo(filteredGrupos);

    if (searchTerm.length > 0) {
        document.querySelectorAll('.grupo').forEach(groupDiv => {
            const groupNameFromId = groupDiv.querySelector('h2').id.replace('grupo-', '');
            const originalGroupName = Object.keys(grupos).find(key => key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === groupNameFromId);

            if (filteredGrupos[originalGroupName] && filteredGrupos[originalGroupName].length > 0) {
                groupDiv.classList.add('active');
                const ul = groupDiv.querySelector('ul');
                // Al abrir por búsqueda, también asegurar que se expanda completamente
                ul.style.maxHeight = "2000px";
                groupDiv.querySelector('h2').setAttribute("aria-expanded", "true");
                ul.setAttribute("aria-hidden", "false");
            } else {
                groupDiv.classList.remove('active');
                groupDiv.querySelector('ul').style.maxHeight = null;
                groupDiv.querySelector('h2').setAttribute("aria-expanded", "false");
                groupDiv.querySelector('ul').setAttribute("aria-hidden", "true");
            }

            groupDiv.querySelectorAll('li').forEach(li => {
                if (li.textContent.toLowerCase().includes(searchTerm)) {
                    li.classList.add('search-highlight');
                } else {
                    li.classList.remove('search-highlight');
                }
            });
        });
    } else {
        document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
        document.querySelectorAll('.grupo.active').forEach(groupDiv => {
            groupDiv.classList.remove('active');
            groupDiv.querySelector('ul').style.maxHeight = null;
            groupDiv.querySelector('h2').setAttribute("aria-expanded", "false");
            groupDiv.querySelector('ul').setAttribute("aria-hidden", "true");
        });
    }
});

// Lógica de modo oscuro
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    modeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    modeToggle.setAttribute('aria-label', isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
});

// Cargar preferencia de modo oscuro al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.textContent = '☀️';
        modeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
    } else {
        modeToggle.textContent = '🌙';
        modeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
    }

    renderCatalogo(grupos);
});
