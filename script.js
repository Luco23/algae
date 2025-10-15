// ====================================================================================
// 🚨 ¡ATENCIÓN! CORRECCIÓN DE RUTA CRUCIAL PARA GITHUB PAGES
// ====================================================================================

// 1. REEMPLAZA 'TU_NOMBRE_DE_REPOSITORIO_AQUI' con el nombre EXACTO de tu repositorio (ej: 'catalogo-microalgas')
// 2. SI TU PROYECTO ESTÁ EN LA RAÍZ DE UN DOMINIO PERSONALIZADO (ej: micatalogo.com), DÉJALO VACÍO ('')
const REPO_NAME = 'algae'; 

// ====================================================================================

// Estilos y emojis para cada grupo
const groupStyles = {
    "Cianofitas": { color: "#66BB6A", emoji: "🌿" }, // Verde suave
    "Diatomeas": { color: "#FFD54F", emoji: "🔬" }, // Amarillo ámbar suave
    "Dinoflagelados": { color: "#BA68C8", emoji: "✨" }, // Púrpura suave
    "Clorofitas": { color: "#4FC3F7", emoji: "💧" }, // Azul cielo suave
    "Euglenofitas": { color: "#FF8A65", emoji: "🦠" }, // Naranja suave
    "Feofitas": { color: "#A1887F", emoji: "🍂" }, // Marrón suave
    "Rodofitas": { color: "#F06292", emoji: "🌸" }  // Rosa suave
};

// Variables para los datos cargados
let grupos = {}; // ESTA VARIABLE SERÁ LLENADA POR EL JSON

// Obtiene referencias a los elementos del DOM
const catalogo = document.getElementById("catalogo");
const algaSeleccionada = document.getElementById("algaSeleccionada");
const imagenAlga = document.getElementById("imagenAlga");
const botonImagen = document.getElementById("buscarImagen");
const contenedorImagen = document.getElementById("contenedorImagen");
const cargando = document.getElementById("cargando");
const searchInput = document.getElementById("search-input");
const modeToggle = document.getElementById("mode-toggle");

let allAlgas = []; // Almacena todas las algas para el buscador

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
 * Verifica si una imagen se puede cargar correctamente.
 * @param {string} url - La URL de la imagen a verificar.
 * @returns {Promise<boolean>} True si la imagen carga, false en caso contrario.
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
 * Contiene las URLs de imágenes específicas para cada microalga.
 */
function obtenerImagenEspecifica(nombre) {
    const imagenesEspecificas = {
        // Cianofitas Originales y Extra
        "Spirulina": "https://atlasofcyanobacteria.com/Cyanobacteria/Spirulinales/Spirulinaceae/Spirulina/major/spirulina-major-151.jpg",
        "Oscillatoria": "https://teamaquafix.com/wp-content/uploads/Oscillatoria.jpg",
        "Merismopedia": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTu04rXr3k_Nw0j2P_meBnyoM1NkEoeCuZYQ&s",
        "Rivularia": "https://atlasofcyanobacteria.com/Cyanobacteria/Nostocales/Rivulariaceae/Rivularia/minutula/rivularia-minutula-473.jpg",
        "Nostoc": "https://inaturalist-open-data.s3.amazonaws.com/photos/31323984/large.jpg",
        "Anabaena": "https://atlasofcyanobacteria.com/Cyanobacteria/Nostocales/Nostocaceae/Anabaena/oscillarioides/anabaena-oscillarioides-624.jpg",
        "Microcystis": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Microcystis_aeruginosa.jpeg",
        "Lyngbya": "https://atlasofcyanobacteria.com/Cyanobacteria/Oscillatoriales/Oscillatoriaceae/Lyngbya/sp/lyngbya-198.jpg",
        "Micrasterias": "https://upload.wikimedia.org/wikipedia/commons/4/47/Micrasterias_radiata.jpg",
        "Nodularia": "https://inaturalist-open-data.s3.amazonaws.com/photos/34529518/large.jpg",
        "Arthrospira": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Spirul2.jpg",
        "Aphanizomenom": "https://img.algaebase.org/images/5B7BE95A076ca2A24CplH2C4D9E6/QH2wrmBHskRF.jpg",
        "Cylindrospermun": "https://www.shetlandlochs.com/site/assets/files/2785/v49_r6.jpg",
        "Gloeocapsa": "https://inaturalist-open-data.s3.amazonaws.com/photos/7956217/large.jpg",
        "Anacystis": "https://inaturalist-open-data.s3.amazonaws.com/photos/45077704/medium.jpg",

        // Diatomeas Originales y Extra
        "Skeletonema": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Skeletonema_costatum.jpg/400px-Skeletonema_costatum.jpg",
        "Chaetocero": "https://inaturalist-open-data.s3.amazonaws.com/photos/82380/original.png",
        "Rhizosolenia": "https://inaturalist-open-data.s3.amazonaws.com/photos/2307922/original.jpg",
        "Biddulphia": "https://static.inaturalist.org/photos/7566711/large.jpg",
        "Thalassiosira": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Thalassiosira_weissflogii.jpg/400px-Thalassiosira_weissflogii.jpg",
        "Coscinodiscus": "https://inaturalist-open-data.s3.amazonaws.com/photos/5578370/original.jpeg",
        "Pleurosigma": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pleurosigma_angulatum_SEM.jpg/400px-Pleurosigma_angulatum_SEM.jpg",
        "Gyrosigma": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Gyrosigma_attenuatum.jpg/400px-Gyrosigma_attenuatum.jpg",
        "Ditylum": "https://inaturalist-open-data.s3.amazonaws.com/photos/344056772/large.jpg",
        "Navícula": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Navicula_sp.jpg/400px-Navicula_sp.jpg",
        "Pinnularia": "https://upload.wikimedia.org/wikipedia/commons/7/76/Pinnularia_major.jpg",
        "Asterionella": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Asterionella_formosa.jpg/400px-Asterionella_formosa.jpg",
        "Tabellaría": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Tabellaria_fenestrata.jpg/400px-Tabellaria_fenestrata.jpg",
        "Melosira": "https://inaturalist-open-data.s3.amazonaws.com/photos/21305667/original.jpg",
        "Bacteriastrum": "https://www.biol.lu.se/fytoplankton/diatoms/Bacteriastrum_hyalinum.jpg",
        "Lithodesmium": "https://static.inaturalist.org/photos/217423517/large.png",
        "Triceratium": "https://img.algaebase.org/images/60162F0911c080308AWkr31A74EB/VEGLiw3Z5Sca.jpg",
        "Thalassiothrix": "https://inaturalist-open-data.s3.amazonaws.com/photos/1368855/large.jpg",
        "Nitzchia": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nitzschia_sp.jpeg",
        "Surilella": "https://live.staticflickr.com/3155/2831738286_1d6e6cae35_c.jpg",
        "Diploneis": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Diploneis_smithii_var._dilatata.jpg/400px-Diploneis_smithii_var._dilatata.jpg",
        "Amphora": "https://inaturalist-open-data.s3.amazonaws.com/photos/449576/original.jpg",
        "Dictyocha": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Dictyocha_speculum.jpg",
        "Meridion": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Meridion_circulare.jpg/400px-Meridion_circulare.jpg",
        "Gompkonema": "https://www.landcareresearch.co.nz/assets/Tools-And-Resources/Identification/algae/gomphonema1000__ScaleWidthWzEwMjRd.jpg",
        "Fragilaria": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Fragilaria_crotonensis.jpg/400px-Fragilaria_crotonensis.jpg",

        // Dinoflagelados Originales y Extra
        "Ceratium": "https://upload.wikimedia.org/wikipedia/commons/5/50/Ceratium_sp_umitunoobimusi.jpg",
        "Dinophysis": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Dinophysis_acuminata.jpg",
        "Noctiluca": "https://live.staticflickr.com/4406/36620227182_24e2553a93_b.jpg",
        "Peridinium": "https://inaturalist-open-data.s3.amazonaws.com/photos/432497560/large.jpg",
        "Gymnodinium": "https://inaturalist-open-data.s3.amazonaws.com/photos/7600474/large.jpg",

        // Clorofitas Originales y Extra
        "Tetraselmis": "https://inaturalist-open-data.s3.amazonaws.com/photos/197884735/large.jpg",
        "Dunaliella": "https://www.researchgate.net/publication/281482708/figure/fig4/AS:1088567342309377@1636546087119/Dunaliella-sp-microalga-48.jpg",
        "Chlorella": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Chlorella_vulgaris.jpg/400px-Chlorella_vulgaris.jpg",
        "Pediastrum": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Pediastrum_duplex.jpg/400px-Pediastrum_duplex.jpg",
        "Closterium": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Closterium_venus.jpg/400px-Closterium_venus.jpg",
        "Cosmarium": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Cosmarium_botrytis.jpg/400px-Cosmarium_botrytis.jpg",
        "Ankistrodesmus": "https://img.algaebase.org/images/AC1F05100321923A15IUB4E5FD00/e1w3pbYnHD9H.jpg",
        "Scenedesmus": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Scenedesmus_quadricauda.jpg/400px-Scenedesmus_quadricauda.jpg",
        "Volvox": "https://cdn.britannica.com/04/40604-004-AFBDAA4A-Colonies-thousands-cells-Volvox-globator-flagella-cell.jpg",
        "Spirogyra": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Spirogyra_sp.jpg/400px-Spirogyra_sp.jpg",
        "Oedogonium": "https://cdn.britannica.com/13/42313-050-CDC1171C-Oedogonium-filaments-oogonia.jpg",
        "Zygnema": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Zygnema_sp.jpg/400px-Zygnema_sp.jpg",
        "Ulva": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Meersalat-Ulva-lactuca.jpg",
        "Codium": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Codium_fragile.jpg/400px-Codium_fragile.jpg",
        "Pandorina": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Pandorina_morum.jpg/400px-Pandorina_morum.jpg",
        "Gonium": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gonium_pectorale_2.jpg/400px-Gonium_pectorale_2.jpg",
        "Staurastrum": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Staurastrum_cingulum.jpg/400px-Staurastrum_cingulum.jpg",
        "Chlamydomonas": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwHXFQ-EsXWCUq-WWHNwRO0HFvBYCw8RmK5Q&s",
        "Nitella": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Nitella_flexilis.jpg/400px-Nitella_flexilis.jpg",
        "Caulerpa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Caulerpa_taxifolia.jpg/400px-Caulerpa_taxifolia.jpg",
        "Enteromorpha": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ulva_intestinalis_-_gut_weed.jpg/400px-Ulva_intestinalis_-_gut_weed.jpg",
        "Ulothrix": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Ulothrix.jpg/400px-Ulothrix.jpg",
        "Chaetomorpha": "https://turismo.santander.es/inventario-litoral/sites/default/files/2022-06/Cheatomorpha_sp.jpg",
        "Rhizoclonium": "https://www.landcareresearch.co.nz/assets/Tools-And-Resources/Identification/algae/rhizoclonium640__ScaleWidthWzEwMjRd.jpg",
        "Halimeda": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Halimeda_incrassata.jpg/400px-Halimeda_incrassata.jpg",
        "Euastrium": "https://upload.wikimedia.org/wikipedia/commons/8/89/Bancs%C3%B3_2021_Fig_9-14_Euastrum_oblongum_cropped.jpg",
        "Palmella": "https://img.algaebase.org/images/AC1F25A604fc430D59wKB5097BFA/mtWA32AnPEGt.jpg",
        "Coelastrum": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Coelastrum_sphaericum.jpg/400px-Coelastrum_sphaericum.jpg",
        "Chlorococcum": "https://inaturalist-open-data.s3.amazonaws.com/photos/366346219/original.jpg",
        "Hidrodictium": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hydrodictyon_amimidoro01.jpg/250px-Hidrodictium_amimidoro01.jpg",

        // Euglenofitas Originales y Extra
        "Euglena": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Euglena_gracilis.jpg/400px-Euglena_gracilis.jpg",
        "Phacus": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Phacus_longicauda.jpg/400px-Phacus_longicauda.jpg",
        "Paranema": "https://live.staticflickr.com/3262/2657110932_5a19728509_c.jpg",
        "Astasia": "https://live.staticflickr.com/2236/3533572343_bbdf18f6dd_c.jpg",

        // Feofitas Originales y Extra
        "Padina": "https://www.cibsub.cat/rcs_gene/Padina_pavonica000.jpg",
        "Sargassum": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sargassum_muticum_Yendo_Fensholt_1955_Lamiot_WimmereuxHautsDeFrance_Estran_Juillet_2016a4.jpg/960px-Sargassum_muticum_Yendo_Fensholt_1955_Lamiot_WimmereuxHautsDeFrance_Estran_Juillet_2016a4.jpg",
        "Laminaria": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Laminaria_digitata_-_NHMW-Botanik.jpg/400px-Laminaria_digitata_-_NHMW-Botanik.jpg",
        "Undaria": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Undaria_pinnatifida_alga.jpg/400px-Undaria_pinnatifida_alga.jpg",
        "Colpomenia": "https://inaturalist-open-data.s3.amazonaws.com/photos/6723579/large.jpeg",
        "Dicyota": "https://inaturalist-open-data.s3.amazonaws.com/photos/314113912/original.jpeg",

        // Rodofitas Originales y Extra
        "Corallina": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Corallinapinnatifolia.JPG",
        "Gracilaria": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Gracilaria_salicornia.jpg/400px-Gracilaria_salicornia.jpg",
        "Gigartina": "https://upload.wikimedia.org/wikipedia/commons/a/af/Chondrus_crispus_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-034_cropped.jpg",
        "Chondrus": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Chondrus_crispus_at_low_tide.jpg/400px-Chondrus_crispus_at_low_tide.jpg",
        "Kappaphycus": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Kappaphycus_alvarezii_farm.jpg/400px-Kappaphycus_alvarezii_farm.jpg"
    };
    return imagenesEspecificas[nombre] || null;
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
 * Intenta encontrar una imagen para la microalga.
 * Retorna la URL de la primera imagen válida encontrada.
 */
async function buscarImagenAutomatica(nombre) {
    try {
        const imagenEspecifica = obtenerImagenEspecifica(nombre);
        if (imagenEspecifica && await verificarImagen(imagenEspecifica)) {
            return imagenEspecifica;
        }

        const imagenWiki = await buscarEnWikimediaCommons(nombre);
        if (imagenWiki && await verificarImagen(imagenWiki)) {
            return imagenWiki;
        }

        const imagenINaturalist = await buscarEnINaturalist(nombre);
        if (imagenINaturalist && await verificarImagen(imagenINaturalist)) {
            return imagenINaturalist;
        }

        return null;
    } catch (error) {
        console.error("Error general en la búsqueda automática de imagen:", error);
        return null;
    }
}


/**
 * Renderiza el catálogo de microalgas.
 * @param {Object} filteredGrupos - Los grupos de algas a mostrar.
 */
function renderCatalogo(filteredGrupos) {
    catalogo.innerHTML = ''; // Limpiar catálogo existente
    allAlgas = []; // Resetear la lista de todas las algas

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
 * >>> IMPLEMENTACIÓN DE CACHING <<<
 * @param {string} nombre - El nombre de la microalga a mostrar.
 */
async function mostrarAlga(nombre) {
    algaSeleccionada.textContent = nombre;
    contenedorImagen.style.display = "none";
    cargando.style.display = "flex";
    botonImagen.style.display = "inline-block";
    botonImagen.dataset.nombre = nombre;
    localStorage.setItem('ultimaAlgaSeleccionada', nombre);

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

    // --- 🚀 Lógica de Caching ---
    const CACHE_KEY = `img_cache_${nombre}`;
    const cachedUrl = localStorage.getItem(CACHE_KEY);

    if (cachedUrl) {
        // Usar caché si está disponible
        mostrarImagen(cachedUrl, `${nombre} - Cached`);
        return;
    }
    // --- Fin Lógica de Caching ---
    
    // Si no está en caché, buscar la imagen automáticamente
    const url = await buscarImagenAutomatica(nombre);

    if (url) {
        mostrarImagen(url, `${nombre} - Imagen Encontrada`);
        localStorage.setItem(CACHE_KEY, url); // Guardar en caché para futuras visitas
    } else {
        cargando.style.display = "none";
        contenedorImagen.style.display = "none";
        algaSeleccionada.innerHTML = `${nombre}<br><small style="color: #ffcc00; font-size: 0.8em;">No se encontró imagen disponible. Haz clic en 'Buscar en Google Imágenes' para explorar más.</small>`;
    }
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

// Busca la microalga en Google Images
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
                ul.style.maxHeight = "2000px"; /* Ajustado a 2000px */
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


/**
 * Carga los datos de microalgas desde el archivo JSON y renderiza el catálogo.
 */
async function fetchDataAndRender() {
    try {
        // CONSTRUCCIÓN DINÁMICA DE LA RUTA: Añade el nombre del repositorio si existe.
        const basePath = REPO_NAME ? `/${REPO_NAME}` : '';
        const fetchURL = `${basePath}/data/microalgas.json`;
        
        console.log("Intentando cargar JSON desde:", fetchURL); // Diagnóstico útil
        
        const response = await fetch(fetchURL); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Path used: ${fetchURL}`);
        }
        grupos = await response.json(); // Los datos cargados ahora llenan la variable 'grupos'
        renderCatalogo(grupos); // Llama a la función de renderizado con los datos
    } catch (error) {
        console.error("Fallo al cargar los datos del catálogo:", error);
        catalogo.innerHTML = `<p class="error">⚠️ Error al cargar el catálogo. Por favor, revisa la Consola (F12) para el error. Mensaje: ${error.message}</p>`;
    }
}


// Cargar preferencia de modo oscuro y datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.textContent = '☀️';
        modeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
    } else {
        // Asegurarse de que el icono inicial sea la luna
        modeToggle.textContent = '🌙'; 
        modeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
    }

    // Llama a la nueva función de carga asíncrona en lugar de renderizar directamente
    fetchDataAndRender(); 
});

