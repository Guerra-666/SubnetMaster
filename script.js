function toggleModal() {
    const modal = document.getElementById('modal');
    modal.classList.toggle('hidden');
}

function generarCamposNombres() {
    const contenedor = document.getElementById('nombreSubredes');
    const numSubnets = parseInt(document.getElementById('subnets').value);
    contenedor.innerHTML = '';
    
    for(let i = 0; i < numSubnets; i++) {
        contenedor.innerHTML += `
            <input type="text" 
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                placeholder="Área ${i + 1}">`;
    }
}

function calcularSubredes() {
    const tabla = document.getElementById('tabla-resultados');
    const numSubnets = parseInt(document.getElementById('subnets').value);
    const nombres = Array.from(document.querySelectorAll('#nombreSubredes input')).map((input, i) => 
        input.value.trim() || `Área ${i + 1}`);

    if (!isPotenciaDeDos(numSubnets)) {
        tabla.innerHTML = `<tr><td colspan="7" class="px-5 py-4 text-red-600 text-sm font-medium">⚠️ Debe ser una potencia de 2 (2, 4, 8, 16...)</td></tr>`;
        return;
    }

    const network = [192, 168, 1, 0];
    const bitsOriginales = 24;
    const bitsPrestados = Math.log2(numSubnets);
    const nuevoPrefijo = bitsOriginales + bitsPrestados;
    const mascara = calcularMascara(nuevoPrefijo);
    const bloque = Math.pow(2, 32 - nuevoPrefijo);

    tabla.innerHTML = '';
    for(let i = 0; i < numSubnets; i++) {
        const inicio = [...network];
        inicio[3] = i * bloque;
        
        const final = [...inicio];
        final[3] += bloque - 1;
        
        const broadcast = [...final];
        const primeraIP = [...inicio]; primeraIP[3]++;
        const ultimaIP = [...final]; ultimaIP[3]--;
        
        tabla.innerHTML += `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-5 py-4 text-sm font-medium text-gray-900">${nombres[i]}</td>
                <td class="px-5 py-4 text-sm font-mono text-gray-700">${formatIP(inicio)}</td>
                <td class="px-5 py-4 text-sm font-mono text-blue-600 font-medium">${formatIP(primeraIP)}</td>
                <td class="px-5 py-4 text-sm font-mono text-green-600 font-medium">${formatIP(ultimaIP)}</td>
                <td class="px-5 py-4 text-sm font-mono text-red-500">${formatIP(broadcast)}</td>
                <td class="px-5 py-4 text-sm font-mono text-gray-700">
                    <div>${formatIP(mascara)}</div>
                    <div class="text-xs text-gray-400 mt-0.5">/${nuevoPrefijo}</div>
                </td>
                <td class="px-5 py-4 text-sm font-mono text-purple-600">+${bloque}</td>
            </tr>`;
    }
}

function mostrarExplicacion() {
    const numSubnets = parseInt(document.getElementById('subnets').value);
    const pasos = document.getElementById('pasosCalculo');
    let explicacion = '';
    
    if (isPotenciaDeDos(numSubnets)) {
        const bitsPrestados = Math.log2(numSubnets);
        const nuevoPrefijo = 24 + bitsPrestados;
        const bloque = Math.pow(2, 32 - nuevoPrefijo);
        explicacion = `
            <div class="space-y-4">
                <div class="p-4 bg-blue-50/50 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span class="text-sm font-bold text-blue-600">${bitsPrestados}</span>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-blue-600">BITS PRESTADOS</p>
                            <p class="text-xs text-blue-500 mt-0.5">2^${bitsPrestados} = ${numSubnets}</p>
                        </div>
                    </div>
                </div>
                
                <div class="p-4 bg-green-50/50 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-sm font-bold text-green-600">${bloque - 2}</span>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-green-600">HOSTS DISPONIBLES</p>
                            <p class="text-xs text-green-500 mt-0.5">${bloque} - 2</p>
                        </div>
                    </div>
                </div>
                
                <div class="p-4 bg-purple-50/50 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span class="text-sm font-bold text-purple-600">/${nuevoPrefijo}</span>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-purple-600">NUEVA MÁSCARA</p>
                            <p class="text-xs text-purple-500 mt-0.5">${formatIP(calcularMascara(nuevoPrefijo))}</p>
                        </div>
                    </div>
                </div>
            </div>`;
    } else {
        explicacion = `<div class="p-3 bg-red-50/50 rounded-xl text-red-600 text-xs font-medium">Se requiere una potencia de 2</div>`;
    }
    pasos.innerHTML = explicacion;
    toggleModal();
}

// Funciones auxiliares
const isPotenciaDeDos = n => n > 0 && (n & (n - 1)) === 0;
const formatIP = octetos => octetos.join('.');

function calcularMascara(prefijo) {
    const mascara = [255, 255, 255, 255];
    let bitsRestantes = 32 - prefijo;
    for(let i = 3; i >= 0 && bitsRestantes > 0; i--) {
        const bits = Math.min(8, bitsRestantes);
        mascara[i] = 256 - Math.pow(2, bits);
        bitsRestantes -= bits;
    }
    return mascara;
}

// Inicializar campos al cargar
generarCamposNombres();