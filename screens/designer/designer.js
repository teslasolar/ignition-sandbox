// Enhanced Perspective Designer - JavaScript Module
const Designer = {
    // Enhanced component definitions including custom shapes
    components: {
        display: [
            { name: 'Label', type: 'ia.display.label', icon: 'L', props: { text: 'Label' }, size: [100, 30] },
            { name: 'Image', type: 'ia.display.image', icon: 'I', props: { source: '' }, size: [150, 100] },
            { name: 'LED Display', type: 'ia.display.led-display', icon: 'D', props: {}, size: [120, 35] },
            { name: 'Table', type: 'ia.display.table', icon: 'T', props: {}, size: [300, 200] },
            { name: 'Symbol', type: 'ia.display.symbol', icon: 'S', props: {}, size: [100, 100] }
        ],
        input: [
            { name: 'Button', type: 'ia.input.button', icon: 'B', props: { text: 'Button' }, size: [100, 40] },
            { name: 'Text Field', type: 'ia.input.text-field', icon: 'F', props: { placeholder: 'Text...' }, size: [150, 35] },
            { name: 'Slider', type: 'ia.input.slider', icon: 'S', props: { min: 0, max: 100 }, size: [200, 40] }
        ],
        container: [
            { name: 'Flex Container', type: 'ia.container.flex', icon: 'F', props: { direction: 'column' }, size: [200, 150] },
            { name: 'Coordinate Container', type: 'ia.container.coord', icon: 'C', props: { mode: 'percent' }, size: [300, 200] }
        ],
        process: [
            { name: 'Pipe Horizontal', type: 'ia.display.label', icon: '-', props: { text: '', style: { backgroundColor: '#6b7280', borderRadius: '0px' } }, size: [100, 8] },
            { name: 'Pipe Vertical', type: 'ia.display.label', icon: '|', props: { text: '', style: { backgroundColor: '#6b7280', borderRadius: '0px' } }, size: [8, 100] },
            { name: 'Pipe Elbow', type: 'ia.display.label', icon: 'E', props: { text: '', style: { backgroundColor: '#6b7280' } }, size: [20, 20] },
            { name: 'Pipe Tee', type: 'ia.display.label', icon: 'T', props: { text: '', style: { backgroundColor: '#6b7280' } }, size: [20, 20] },
            { name: 'Flow Arrow', type: 'ia.display.label', icon: '>', props: { text: '>', style: { fontSize: '16px', color: '#ef4444', fontWeight: 'bold' } }, size: [30, 20] },
            { name: 'Valve', type: 'ia.display.label', icon: 'V', props: { text: 'V', style: { fontSize: '20px', color: '#6b7280' } }, size: [25, 25] }
        ],
        equipment: [
            { name: 'Tank', type: 'ia.display.tank', icon: 'T', props: { level: 50, fillColor: '#6b7280' }, size: [80, 120] },
            { name: 'Valve', type: 'ia.display.valve', icon: 'V', props: { position: 50 }, size: [40, 40] },
            { name: 'Pump', type: 'ia.display.label', icon: 'P', props: { text: 'PUMP', style: { border: '2px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)', borderRadius: '50%' } }, size: [60, 60] },
            { name: 'Motor', type: 'ia.display.label', icon: 'M', props: { text: 'M', style: { border: '2px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)', borderRadius: '50%', fontSize: '20px', fontWeight: 'bold' } }, size: [50, 50] },
            { name: 'Sensor', type: 'ia.display.label', icon: 'S', props: { text: 'PT', style: { border: '1px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)', fontSize: '12px' } }, size: [30, 20] }
        ],
        feeders: [
            { name: 'Hopper Feeder', type: 'ia.display.label', icon: 'H', props: { text: 'HOPPER', style: { border: '2px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)' } }, size: [80, 100] },
            { name: 'Belt Feeder', type: 'ia.display.label', icon: 'B', props: { text: 'BELT', style: { border: '2px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)', borderRadius: '10px' } }, size: [120, 40] },
            { name: 'Screw Feeder', type: 'ia.display.label', icon: 'S', props: { text: 'SCREW', style: { border: '2px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)' } }, size: [100, 50] },
            { name: 'Vibratory Feeder', type: 'ia.display.label', icon: 'V', props: { text: 'VIB', style: { border: '2px solid #6b7280', backgroundColor: 'rgba(107,114,128,0.1)' } }, size: [90, 45] }
        ],
        custom: []
    },

    customShapes: new Map(),

    state: {
        components: [],
        selectedComponent: null,
        dragData: null,
        isDragging: false,
        isResizing: false,
        componentCounter: 0,
        scale: 1,
        gridEnabled: true,
        snapEnabled: true,
        pipeMode: false,
        pipeStart: null,
        pipes: [],
        pipeCounter: 0,
        offset: { x: 0, y: 0 },
        mouseDown: false,
        startX: 0,
        startY: 0
    },

    elements: {
        canvas: null,
        properties: null,
        json: null
    },

    init() {
        this.elements.canvas = document.getElementById('canvas');
        this.elements.properties = document.getElementById('properties');
        this.elements.json = document.getElementById('json');

        this.loadTemplates();
        this.buildPalette();
        this.setupEventListeners();
        this.updateInfo();
        this.generateJSON();
        ShapeEditor.init();

        console.log('Enhanced Perspective Designer initialized');
    },

    async loadTemplates() {
        try {
            const response = await fetch('../templates/manifest.json');
            if (response.ok) {
                const templates = await response.json();
                this.templates = templates;
                console.log('Loaded templates:', templates);
            }
        } catch (e) {
            console.log('No templates manifest found');
        }
    },

    buildPalette() {
        const palette = document.getElementById('palette');
        let html = '';

        Object.entries(this.components).forEach(([category, components]) => {
            if (components.length === 0) return;

            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            const icons = {
                display: 'D', input: 'I', container: 'C',
                process: 'P', equipment: 'E', feeders: 'F', custom: '*'
            };

            html += `
                <div class="category">
                    <div class="category-header" onclick="Designer.toggleCategory(this)">
                        <span class="category-title">[${icons[category] || '?'}] ${categoryName}</span>
                        <span class="category-count">${components.length}</span>
                    </div>
                    <div class="category-content">
                        ${components.map(comp => `
                            <div class="item" draggable="true"
                                 data-category="${category}"
                                 data-type="${comp.type}"
                                 data-name="${comp.name}">
                                <div class="item-name">[${comp.icon}] ${comp.name}</div>
                                <div class="item-type">${comp.type}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        palette.innerHTML = html;
    },

    setupEventListeners() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('item')) {
                const category = e.target.dataset.category;
                const type = e.target.dataset.type;
                const name = e.target.dataset.name;

                this.state.dragData = { category, type, name };
                e.dataTransfer.effectAllowed = 'copy';
            }
        });

        this.elements.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.elements.canvas.addEventListener('drop', (e) => {
            e.preventDefault();

            if (this.state.dragData) {
                const rect = this.elements.canvas.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                this.addComponent(this.state.dragData, x, y);
                this.state.dragData = null;
            }
        });

        this.elements.canvas.addEventListener('click', (e) => {
            if (this.state.pipeMode) {
                this.handlePipeClick(e);
            } else if (e.target === this.elements.canvas || e.target.classList.contains('grid')) {
                this.selectComponent(null);
            }
        });

        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.state.selectedComponent) {
                this.deleteComponent();
            } else if (e.key === 'Escape') {
                this.state.pipeMode = false;
                this.state.pipeStart = null;
                this.updatePipeButton();
            } else if (e.ctrlKey && e.key === 'c' && this.state.selectedComponent) {
                this.duplicateComponent();
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveView();
            }
        });
    },

    handleMouseDown(e) {
        if (e.target.classList.contains('component') && !this.state.pipeMode) {
            const componentId = e.target.dataset.id;
            const component = this.state.components.find(c => c.id === componentId);

            if (component) {
                this.state.mouseDown = true;
                this.state.startX = e.clientX;
                this.state.startY = e.clientY;
                this.state.isDragging = false;
                this.selectComponent(component);
                e.preventDefault();
            }
        }
    },

    handleMouseMove(e) {
        if (this.state.mouseDown && this.state.selectedComponent && !this.state.pipeMode) {
            const deltaX = e.clientX - this.state.startX;
            const deltaY = e.clientY - this.state.startY;

            if (!this.state.isDragging && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                this.state.isDragging = true;
                const el = document.querySelector(`[data-id="${this.state.selectedComponent.id}"]`);
                if (el) el.classList.add('dragging');
            }

            if (this.state.isDragging) {
                const rect = this.elements.canvas.getBoundingClientRect();
                const newX = this.state.selectedComponent.x + (deltaX / rect.width) * 100;
                const newY = this.state.selectedComponent.y + (deltaY / rect.height) * 100;

                this.updateComponentPosition(newX, newY);
                this.state.startX = e.clientX;
                this.state.startY = e.clientY;
            }
        }
    },

    handleMouseUp(e) {
        if (this.state.isDragging) {
            const el = document.querySelector(`[data-id="${this.state.selectedComponent.id}"]`);
            if (el) el.classList.remove('dragging');
            this.generateJSON();
        }

        this.state.mouseDown = false;
        this.state.isDragging = false;
    },

    updateComponentPosition(x, y) {
        if (!this.state.selectedComponent) return;

        const snapX = this.state.snapEnabled ? Math.round(x / 5) * 5 : x;
        const snapY = this.state.snapEnabled ? Math.round(y / 5) * 5 : y;

        const constrainedX = Math.max(0, Math.min(95, snapX));
        const constrainedY = Math.max(0, Math.min(95, snapY));

        this.state.selectedComponent.x = constrainedX;
        this.state.selectedComponent.y = constrainedY;

        const el = document.querySelector(`[data-id="${this.state.selectedComponent.id}"]`);
        if (el) {
            el.style.left = `${constrainedX}%`;
            el.style.top = `${constrainedY}%`;
        }

        this.updatePropertiesPosition();
    },

    updatePropertiesPosition() {
        const xInput = document.querySelector('input[onchange*="updateProperty(\'x\'"]');
        const yInput = document.querySelector('input[onchange*="updateProperty(\'y\'"]');

        if (xInput && this.state.selectedComponent) {
            xInput.value = this.state.selectedComponent.x.toFixed(1);
        }
        if (yInput && this.state.selectedComponent) {
            yInput.value = this.state.selectedComponent.y.toFixed(1);
        }
    },

    addComponent(dragData, x, y) {
        const componentDef = this.findComponentDefinition(dragData.type);
        if (!componentDef) return;

        const component = {
            id: `comp_${++this.state.componentCounter}`,
            type: dragData.type,
            name: `${dragData.name}_${this.state.componentCounter}`,
            category: dragData.category,
            x: this.state.snapEnabled ? Math.round(x / 5) * 5 : x,
            y: this.state.snapEnabled ? Math.round(y / 5) * 5 : y,
            width: (componentDef.size[0] / this.elements.canvas.offsetWidth) * 100,
            height: (componentDef.size[1] / this.elements.canvas.offsetHeight) * 100,
            props: { ...componentDef.props },
            meta: { name: `${dragData.name}_${this.state.componentCounter}` }
        };

        this.state.components.push(component);
        this.renderComponents();
        this.selectComponent(component);
        this.updateInfo();
        this.generateJSON();
        this.showNotification(`Added ${dragData.name}`, 'success');
    },

    findComponentDefinition(type, symbolPath = null) {
        for (const category of Object.values(this.components)) {
            const comp = category.find(c => c.type === type);
            if (comp) return comp;
        }

        if (type === 'ia.display.symbol' && symbolPath) {
            const customShape = Array.from(this.customShapes.values()).find(s =>
                s.props.path === symbolPath
            );
            if (customShape) return customShape;
        }

        return null;
    },

    renderComponents() {
        document.querySelectorAll('.component').forEach(el => el.remove());
        document.querySelectorAll('.pipe-line').forEach(el => el.remove());

        this.state.components.forEach(comp => {
            this.renderComponent(comp);
        });

        this.renderPipes();
    },

    renderPipes() {
        document.querySelectorAll('.pipe-line').forEach(el => el.remove());

        this.state.pipes.forEach(pipe => {
            this.renderPipe(pipe);
        });
    },

    renderPipe(pipe) {
        if (!pipe.visible) return;

        const canvasWidth = this.elements.canvas.offsetWidth;
        const canvasHeight = this.elements.canvas.offsetHeight;

        const startX = (pipe.origin.x / 1000) * 100;
        const startY = (pipe.origin.y / 600) * 100;

        pipe.origin.connections.forEach(connection => {
            const endX = (connection.x / 1000) * 100;
            const endY = (connection.y / 600) * 100;

            const pipeEl = document.createElement('div');
            pipeEl.className = 'pipe-line';
            pipeEl.dataset.pipeName = pipe.name;

            const deltaX = Math.abs(endX - startX);
            const deltaY = Math.abs(endY - startY);

            if (deltaX > deltaY) {
                pipeEl.style.left = `${Math.min(startX, endX)}%`;
                pipeEl.style.top = `${startY - 0.5}%`;
                pipeEl.style.width = `${deltaX}%`;
                pipeEl.style.height = `${pipe.width / canvasHeight * 100}%`;
            } else {
                pipeEl.style.left = `${startX - 0.5}%`;
                pipeEl.style.top = `${Math.min(startY, endY)}%`;
                pipeEl.style.width = `${pipe.width / canvasWidth * 100}%`;
                pipeEl.style.height = `${deltaY}%`;
            }

            pipeEl.style.position = 'absolute';
            pipeEl.style.backgroundColor = pipe.stroke;
            pipeEl.style.borderRadius = '2px';
            pipeEl.style.border = `1px solid ${pipe.fill}`;
            pipeEl.style.cursor = 'pointer';
            pipeEl.style.zIndex = '1';

            pipeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectPipe(pipe);
            });

            this.elements.canvas.appendChild(pipeEl);
        });
    },

    selectPipe(pipe) {
        this.state.selectedComponent = null;
        document.querySelectorAll('.component').forEach(el => {
            el.classList.remove('selected');
        });

        document.querySelectorAll('.pipe-line').forEach(el => {
            el.style.boxShadow = el.dataset.pipeName === pipe.name
                ? '0 0 8px rgba(107, 114, 128, 0.5)'
                : 'none';
        });

        this.updatePipeProperties(pipe);
        this.updateInfo();
    },

    updatePipeProperties(pipe) {
        const html = `
            <div class="mb-2">
                <label class="label">Pipe Name</label>
                <input class="input" value="${pipe.name}"
                       onchange="Designer.updatePipeProperty('name', this.value)">
            </div>
            <div class="mb-2">
                <label class="label">Pipe Width (px)</label>
                <input class="input" type="number" value="${pipe.width}" min="1" max="50"
                       onchange="Designer.updatePipeProperty('width', parseInt(this.value))">
            </div>
            <div class="mb-2">
                <label class="label">Stroke Color</label>
                <input class="input" type="color" value="${pipe.stroke}"
                       onchange="Designer.updatePipeProperty('stroke', this.value)">
            </div>
            <div class="mb-2">
                <label class="label">Fill Color</label>
                <input class="input" type="color" value="${pipe.fill}"
                       onchange="Designer.updatePipeProperty('fill', this.value)">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <button class="button danger" onclick="Designer.deletePipe('${pipe.name}')">Delete</button>
                <button class="button secondary" onclick="Designer.duplicatePipe('${pipe.name}')">Clone</button>
            </div>
        `;

        this.elements.properties.innerHTML = html;
        this.selectedPipe = pipe;
    },

    renderComponent(component) {
        const el = document.createElement('div');
        el.className = `component ${component.category}`;
        if (component.category === 'custom' || component.category === 'feeders') {
            el.classList.add('custom-shape');
        }
        el.dataset.id = component.id;

        const content = this.getComponentContent(component);
        el.innerHTML = `
            <div style="padding: 0.2rem; text-align: center; font-size: 0.7rem; overflow: hidden; font-weight: 500;">
                ${content}
            </div>
            <div class="resize-handle"></div>
        `;

        el.style.left = `${component.x}%`;
        el.style.top = `${component.y}%`;
        el.style.width = `${component.width}%`;
        el.style.height = `${component.height}%`;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(component);
        });

        const resizeHandle = el.querySelector('.resize-handle');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startResize(e, component);
            });
        }

        this.elements.canvas.appendChild(el);
    },

    startResize(e, component) {
        this.state.isResizing = true;
        this.state.resizeComponent = component;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = component.width;
        const startHeight = component.height;

        const onMouseMove = (e) => {
            if (this.state.isResizing) {
                const rect = this.elements.canvas.getBoundingClientRect();
                const deltaX = ((e.clientX - startX) / rect.width) * 100;
                const deltaY = ((e.clientY - startY) / rect.height) * 100;

                const newWidth = Math.max(2, startWidth + deltaX);
                const newHeight = Math.max(2, startHeight + deltaY);

                component.width = newWidth;
                component.height = newHeight;

                const el = document.querySelector(`[data-id="${component.id}"]`);
                if (el) {
                    el.style.width = `${newWidth}%`;
                    el.style.height = `${newHeight}%`;
                }

                this.updatePropertiesSize();
            }
        };

        const onMouseUp = () => {
            this.state.isResizing = false;
            this.state.resizeComponent = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.generateJSON();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    },

    updatePropertiesSize() {
        const widthInput = document.querySelector('input[onchange*="updateProperty(\'width\'"]');
        const heightInput = document.querySelector('input[onchange*="updateProperty(\'height\'"]');

        if (widthInput && this.state.resizeComponent) {
            widthInput.value = this.state.resizeComponent.width.toFixed(1);
        }
        if (heightInput && this.state.resizeComponent) {
            heightInput.value = this.state.resizeComponent.height.toFixed(1);
        }
    },

    getComponentContent(component) {
        const def = this.findComponentDefinition(component.type);

        if (component.category === 'process') {
            return `[${def?.icon || 'P'}] ${component.name}`;
        } else if (component.category === 'equipment') {
            return `[${def?.icon || 'E'}] ${component.name}`;
        } else if (component.category === 'feeders') {
            return `[${def?.icon || 'F'}] ${component.name}`;
        } else if (component.category === 'custom' && component.type === 'ia.display.symbol' && component.props.customShape) {
            const symbolPath = component.props.path || '';
            const shapeName = symbolPath.replace('custom/', '').replace(/_/g, ' ');
            const customShape = Array.from(this.customShapes.values()).find(s =>
                s.props.path === component.props.path
            );
            return customShape?.svg || `[*] ${shapeName}`;
        }

        return `[${def?.icon || '?'}] ${component.name}`;
    },

    selectComponent(component) {
        this.state.selectedComponent = component;
        this.selectedPipe = null;

        document.querySelectorAll('.component').forEach(el => {
            el.classList.remove('selected');
        });

        document.querySelectorAll('.pipe-line').forEach(el => {
            el.style.boxShadow = 'none';
        });

        if (component) {
            const el = document.querySelector(`[data-id="${component.id}"]`);
            if (el) el.classList.add('selected');
            this.updateProperties(component);
        } else {
            this.clearProperties();
        }

        this.updateInfo();
    },

    updateProperties(component) {
        let html = `
            <div class="mb-2">
                <label class="label">Component Type</label>
                <input class="input" value="${component.type}" readonly>
            </div>
            <div class="mb-2">
                <label class="label">Name</label>
                <input class="input" value="${component.name}"
                       onchange="Designer.updateProperty('name', this.value)">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div>
                    <label class="label">X (%)</label>
                    <input class="input" type="number" value="${component.x.toFixed(1)}"
                           step="0.1" onchange="Designer.updateProperty('x', parseFloat(this.value))">
                </div>
                <div>
                    <label class="label">Y (%)</label>
                    <input class="input" type="number" value="${component.y.toFixed(1)}"
                           step="0.1" onchange="Designer.updateProperty('y', parseFloat(this.value))">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div>
                    <label class="label">Width (%)</label>
                    <input class="input" type="number" value="${component.width.toFixed(1)}"
                           step="0.1" onchange="Designer.updateProperty('width', parseFloat(this.value))">
                </div>
                <div>
                    <label class="label">Height (%)</label>
                    <input class="input" type="number" value="${component.height.toFixed(1)}"
                           step="0.1" onchange="Designer.updateProperty('height', parseFloat(this.value))">
                </div>
            </div>
        `;

        if (component.type === 'ia.display.symbol') {
            html += `
                <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: rgba(107, 114, 128, 0.1); border-radius: 4px; font-size: 0.7rem; color: #9ca3af;">
                    <strong>Symbol Component:</strong> References a symbol from your Ignition symbol library.
                </div>
            `;
        }

        html += `
            <div class="mb-2">
                <label class="label">Properties (JSON)</label>
                <textarea class="input" rows="4" style="font-family: monospace; font-size: 0.7rem;"
                          onchange="Designer.updateComponentProperties(this.value)">${JSON.stringify(component.props, null, 2)}</textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <button class="button danger" onclick="Designer.deleteComponent()">Delete</button>
                <button class="button secondary" onclick="Designer.duplicateComponent()">Clone</button>
            </div>
        `;

        this.elements.properties.innerHTML = html;
    },

    clearProperties() {
        this.elements.properties.innerHTML = `
            <div class="text-center text-sm p-2" style="color: #64748b;">
                Select a component to edit properties
            </div>
        `;
    },

    updateProperty(property, value) {
        if (!this.state.selectedComponent) return;

        this.state.selectedComponent[property] = value;

        const el = document.querySelector(`[data-id="${this.state.selectedComponent.id}"]`);
        if (el) {
            if (property === 'name') {
                this.state.selectedComponent.meta.name = value;
            } else if (['x', 'y', 'width', 'height'].includes(property)) {
                const styleMap = { x: 'left', y: 'top', width: 'width', height: 'height' };
                el.style[styleMap[property]] = `${value}%`;
            }
        }

        this.generateJSON();
    },

    updateComponentProperties(jsonString) {
        if (!this.state.selectedComponent) return;

        try {
            this.state.selectedComponent.props = JSON.parse(jsonString);
            this.generateJSON();
            this.showNotification('Properties updated', 'success');
        } catch (e) {
            this.showNotification('Invalid JSON format', 'error');
        }
    },

    updatePipeProperty(property, value) {
        if (!this.selectedPipe) return;

        this.selectedPipe[property] = value;
        this.renderPipes();
        this.generateJSON();

        this.updatePipeProperties(this.selectedPipe);
    },

    deletePipe(pipeName) {
        const pipeIndex = this.state.pipes.findIndex(p => p.name === pipeName);
        if (pipeIndex > -1) {
            this.state.pipes.splice(pipeIndex, 1);
            this.selectedPipe = null;
            this.clearProperties();
            this.renderPipes();
            this.updateInfo();
            this.generateJSON();
            this.showNotification('Pipe deleted', 'success');
        }
    },

    duplicatePipe(pipeName) {
        const originalPipe = this.state.pipes.find(p => p.name === pipeName);
        if (originalPipe) {
            const duplicatePipe = {
                ...originalPipe,
                name: `${originalPipe.name}_copy`,
                origin: {
                    ...originalPipe.origin,
                    x: originalPipe.origin.x + 50,
                    y: originalPipe.origin.y + 50,
                    connections: originalPipe.origin.connections.map(conn => ({
                        x: conn.x + 50,
                        y: conn.y + 50
                    }))
                }
            };

            this.state.pipes.push(duplicatePipe);
            this.renderPipes();
            this.updateInfo();
            this.generateJSON();
            this.showNotification('Pipe duplicated', 'success');
        }
    },

    deleteComponent() {
        if (!this.state.selectedComponent) return;

        const index = this.state.components.indexOf(this.state.selectedComponent);
        if (index > -1) {
            this.state.components.splice(index, 1);
            this.selectComponent(null);
            this.renderComponents();
            this.updateInfo();
            this.generateJSON();
            this.showNotification('Component deleted', 'success');
        }
    },

    duplicateComponent() {
        if (!this.state.selectedComponent) return;

        const original = this.state.selectedComponent;
        const duplicate = {
            ...original,
            id: `comp_${++this.state.componentCounter}`,
            name: `${original.name}_copy`,
            x: original.x + 5,
            y: original.y + 5,
            props: { ...original.props },
            meta: { ...original.meta, name: `${original.name}_copy` }
        };

        this.state.components.push(duplicate);
        this.renderComponents();
        this.selectComponent(duplicate);
        this.updateInfo();
        this.generateJSON();
        this.showNotification('Component duplicated', 'success');
    },

    generateJSON() {
        const rootProps = {
            mode: "percent",
            aspectRatio: "16:9"
        };

        if (this.state.pipes.length > 0) {
            rootProps.pipes = this.state.pipes;
        }

        const view = {
            type: "ia.container.coord",
            version: 0,
            props: rootProps,
            meta: { name: "root" },
            position: {},
            custom: {},
            children: this.generateChildrenJSON(this.state.components)
        };

        const jsonOutput = JSON.stringify([view], null, 2);
        if (this.elements.json) {
            this.elements.json.textContent = jsonOutput;
        }

        if (this.state.components.length > 0 || this.state.pipes.length > 0) {
            console.log(`Perspective JSON generated with ${this.state.components.length} components and ${this.state.pipes.length} pipes`);
        }
    },

    generateChildrenJSON(components) {
        return components.map(comp => {
            const baseComponent = {
                type: comp.type,
                version: 0,
                props: { ...comp.props },
                meta: comp.meta,
                position: {
                    x: comp.x / 100,
                    y: comp.y / 100,
                    width: comp.width / 100,
                    height: comp.height / 100
                },
                custom: {}
            };

            if (comp.children && comp.children.length > 0) {
                baseComponent.children = this.generateChildrenJSON(comp.children);
            }

            return baseComponent;
        });
    },

    addCustomShape(shapeData) {
        this.customShapes.set(shapeData.props.path, shapeData);
        this.components.custom.push(shapeData);
        this.buildPalette();
        this.updateInfo();
        this.showNotification(`Custom shape "${shapeData.name}" added!`, 'success');
    },

    openShapeEditor() {
        document.getElementById('shapeEditor').style.display = 'flex';

        if (!ShapeEditor.canvas) {
            ShapeEditor.canvas = document.getElementById('shapeCanvas');
            if (ShapeEditor.canvas) {
                ShapeEditor.ctx = ShapeEditor.canvas.getContext('2d');
                ShapeEditor.setupEventListeners();
            }
        }

        ShapeEditor.reset();
    },

    closeShapeEditor() {
        document.getElementById('shapeEditor').style.display = 'none';
    },

    updateInfo() {
        document.getElementById('count').textContent = this.state.components.length;
        document.getElementById('selected').textContent = this.state.selectedComponent ? this.state.selectedComponent.name : (this.selectedPipe ? this.selectedPipe.name : 'None');
        document.getElementById('zoom').textContent = Math.round(this.state.scale * 100) + '%';
        document.getElementById('pipeCount').textContent = this.state.pipes.length;
        document.getElementById('customCount').textContent = this.components.custom.length;
    },

    toggleGrid() {
        this.state.gridEnabled = !this.state.gridEnabled;
        document.getElementById('grid').style.display = this.state.gridEnabled ? 'block' : 'none';
        document.getElementById('gridBtn').style.opacity = this.state.gridEnabled ? '1' : '0.5';
    },

    toggleSnap() {
        this.state.snapEnabled = !this.state.snapEnabled;
        document.getElementById('snapBtn').style.opacity = this.state.snapEnabled ? '1' : '0.5';
    },

    togglePipeMode() {
        this.state.pipeMode = !this.state.pipeMode;
        this.state.pipeStart = null;
        this.updatePipeButton();
    },

    updatePipeButton() {
        const pipeBtn = document.getElementById('pipeBtn');
        const pipeStatus = document.getElementById('pipeStatus');

        if (this.state.pipeMode) {
            pipeBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            pipeBtn.textContent = 'Drawing';
            this.elements.canvas.style.cursor = 'crosshair';
            pipeStatus.textContent = 'PIPE MODE: Click two points to draw';
            pipeStatus.style.color = '#10b981';
            this.showNotification('Pipe mode ON - Click two points to draw', 'info');
        } else {
            pipeBtn.style.background = 'linear-gradient(45deg, #6b7280, #4b5563)';
            pipeBtn.textContent = 'Pipes';
            this.elements.canvas.style.cursor = 'default';
            pipeStatus.textContent = 'Use Pipe Tool for P&ID diagrams';
            pipeStatus.style.color = '#9ca3af';
            this.showNotification('Pipe mode OFF', 'info');
        }
    },

    handlePipeClick(e) {
        const rect = this.elements.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const snapX = this.state.snapEnabled ? Math.round(x / 5) * 5 : x;
        const snapY = this.state.snapEnabled ? Math.round(y / 5) * 5 : y;

        if (!this.state.pipeStart) {
            this.state.pipeStart = { x: snapX, y: snapY };
            this.showNotification('Click second point to complete pipe', 'info');
        } else {
            this.createPipe(this.state.pipeStart, { x: snapX, y: snapY });
            this.state.pipeStart = null;
        }
    },

    createPipe(start, end) {
        const canvasWidth = 1000;
        const canvasHeight = 600;
        const startX = (start.x / 100) * canvasWidth;
        const startY = (start.y / 100) * canvasHeight;
        const endX = (end.x / 100) * canvasWidth;
        const endY = (end.y / 100) * canvasHeight;

        const pipe = {
            name: `pipe_${++this.state.pipeCounter}`,
            appearance: "auto",
            flanges: true,
            lineVariant: "solid",
            start: "none",
            end: "none",
            stroke: "#6b7280",
            fill: "#6b7280",
            width: 12,
            origin: {
                x: startX,
                y: startY,
                connections: [
                    {
                        x: endX,
                        y: endY
                    }
                ]
            },
            visible: true
        };

        this.state.pipes.push(pipe);
        this.renderPipes();
        this.updateInfo();
        this.generateJSON();
        this.showNotification('Pipe created!', 'success');
    },

    zoom(delta) {
        this.state.scale = Math.max(0.25, Math.min(3, this.state.scale + delta));
        this.elements.canvas.style.transform = `scale(${this.state.scale})`;
        this.updateInfo();
    },

    resetZoom() {
        this.state.scale = 1;
        this.elements.canvas.style.transform = 'scale(1)';
        this.updateInfo();
    },

    clearAll() {
        if (confirm('Clear all components and pipes?')) {
            this.state.components = [];
            this.state.pipes = [];
            this.state.selectedComponent = null;
            this.selectedPipe = null;
            this.state.componentCounter = 0;
            this.state.pipeCounter = 0;
            this.state.pipeStart = null;

            if (this.state.pipeMode) {
                this.togglePipeMode();
            }

            this.renderComponents();
            this.clearProperties();
            this.updateInfo();
            this.generateJSON();
            this.showNotification('Canvas cleared', 'info');
        }
    },

    toggleCategory(header) {
        const content = header.nextElementSibling;
        content.classList.toggle('collapsed');
    },

    search(term) {
        const items = document.querySelectorAll('.item');
        const searchTerm = term.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const match = text.includes(searchTerm);
            item.style.display = match ? 'block' : 'none';
        });

        document.querySelectorAll('.category').forEach(category => {
            const visibleItems = category.querySelectorAll('.item:not([style*="display: none"])');
            category.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    createTankFarm() {
        if (this.state.components.length > 0 || this.state.pipes.length > 0) {
            if (!confirm('This will clear the current design. Continue?')) {
                return;
            }
        }

        this.state.components = [];
        this.state.pipes = [];
        this.state.componentCounter = 0;
        this.state.pipeCounter = 0;

        const title = {
            id: `comp_${++this.state.componentCounter}`,
            type: 'ia.display.label',
            name: 'FarmTitle',
            category: 'display',
            x: 25,
            y: 5,
            width: 50,
            height: 8,
            props: {
                text: 'Industrial Tank Farm Distribution',
                style: {
                    fontSize: '26px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    textAlign: 'center'
                }
            },
            meta: { name: 'FarmTitle' }
        };
        this.state.components.push(title);

        const tankColors = ['#059669', '#dc2626', '#2563eb', '#f59e0b'];
        const tankNames = ['T-001', 'T-002', 'T-003', 'T-004'];
        const tankLevels = [85, 62, 43, 78];

        for (let i = 0; i < 4; i++) {
            const tank = {
                id: `comp_${++this.state.componentCounter}`,
                type: 'ia.display.tank',
                name: `Tank${i + 1}`,
                category: 'equipment',
                x: 15 + (i * 15),
                y: 20,
                width: 10,
                height: 30,
                props: {
                    level: tankLevels[i],
                    fillColor: tankColors[i],
                    style: {
                        border: `3px solid ${tankColors[i]}`
                    }
                },
                meta: { name: `Tank${i + 1}` }
            };
            this.state.components.push(tank);

            const label = {
                id: `comp_${++this.state.componentCounter}`,
                type: 'ia.display.label',
                name: `Tank${i + 1}Label`,
                category: 'display',
                x: 15 + (i * 15),
                y: 52,
                width: 10,
                height: 6,
                props: {
                    text: `${tankNames[i]}\n${tankLevels[i]}%`,
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: tankColors[i]
                    }
                },
                meta: { name: `Tank${i + 1}Label` }
            };
            this.state.components.push(label);

            const valve = {
                id: `comp_${++this.state.componentCounter}`,
                type: 'ia.display.valve',
                name: `Valve${i + 1}`,
                category: 'equipment',
                x: 17.5 + (i * 15),
                y: 53,
                width: 5,
                height: 8,
                props: {
                    position: i === 2 ? 0 : 80 + (i * 5),
                    style: {
                        color: tankColors[i]
                    }
                },
                meta: { name: `Valve${i + 1}` }
            };
            this.state.components.push(valve);
        }

        const pipes = [
            {
                name: "main_header",
                appearance: "auto",
                flanges: true,
                lineVariant: "solid",
                start: "none",
                end: "none",
                stroke: "#1f2937",
                fill: "#1f2937",
                width: 18,
                origin: {
                    x: 100,
                    y: 400,
                    connections: [{ x: 800, y: 400 }]
                },
                visible: true
            },
            {
                name: "supply_line",
                appearance: "auto",
                flanges: true,
                lineVariant: "solid",
                start: "arrow",
                end: "none",
                stroke: "#7c3aed",
                fill: "#7c3aed",
                width: 15,
                origin: {
                    x: 50,
                    y: 400,
                    connections: [{ x: 100, y: 400 }]
                },
                visible: true
            },
            {
                name: "discharge_line",
                appearance: "auto",
                flanges: true,
                lineVariant: "solid",
                start: "none",
                end: "arrow",
                stroke: "#7c3aed",
                fill: "#7c3aed",
                width: 15,
                origin: {
                    x: 800,
                    y: 400,
                    connections: [{ x: 850, y: 400 }]
                },
                visible: true
            }
        ];

        for (let i = 0; i < 4; i++) {
            pipes.push({
                name: `tank${i + 1}_line`,
                appearance: "auto",
                flanges: true,
                lineVariant: "solid",
                start: "none",
                end: "none",
                stroke: tankColors[i],
                fill: tankColors[i],
                width: 12,
                origin: {
                    x: 200 + (i * 150),
                    y: 400,
                    connections: [{ x: 200 + (i * 150), y: 300 }]
                },
                visible: true
            });
        }

        this.state.pipes = pipes;
        this.state.pipeCounter = pipes.length;

        this.renderComponents();
        this.updateInfo();
        this.generateJSON();
        this.showNotification('Tank farm template created!', 'success');
    },

    copyJSON() {
        const jsonText = this.elements.json.textContent;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(jsonText).then(() => {
                this.showCopySuccess();
            }).catch(err => {
                this.fallbackCopyTextToClipboard(jsonText);
            });
        } else {
            this.fallbackCopyTextToClipboard(jsonText);
        }
    },

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopySuccess();
            } else {
                this.showNotification('Copy failed - try manually', 'error');
            }
        } catch (err) {
            this.showNotification('Copy failed - try manually', 'error');
        }

        document.body.removeChild(textArea);
    },

    showCopySuccess() {
        const copySuccess = document.getElementById('copySuccess');
        copySuccess.classList.add('show');

        setTimeout(() => {
            copySuccess.classList.remove('show');
        }, 2000);

        this.showNotification('JSON copied to clipboard!', 'success');
    },

    downloadJSON() {
        const jsonText = this.elements.json.textContent;
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'perspective-view.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('JSON file downloaded!', 'success');
    },

    saveView() {
        const jsonData = this.elements.json.textContent;
        localStorage.setItem('perspective-designer-view', jsonData);
        this.showNotification('View saved locally!', 'success');
    },

    loadView() {
        const savedData = localStorage.getItem('perspective-designer-view');
        if (savedData) {
            try {
                const viewData = JSON.parse(savedData);
                this.showNotification('Load functionality - parsing saved data...', 'info');
            } catch (e) {
                this.showNotification('Error loading saved data', 'error');
            }
        } else {
            this.showNotification('No saved view found', 'info');
        }
    },

    exportView() {
        this.downloadJSON();
    },

    showTemplates() {
        this.showNotification('Templates: Tank Farm available in toolbar!', 'info');
    }
};

// Shape Editor Module
const ShapeEditor = {
    canvas: null,
    ctx: null,
    currentTool: 'select',
    isDrawing: false,
    shapes: [],
    selectedShape: null,
    undoStack: [],

    init() {
        this.canvas = document.getElementById('shapeCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupEventListeners();
            this.reset();
        }
    },

    setupEventListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    },

    setTool(tool) {
        this.currentTool = tool;
        this.selectedShape = null;
        this.redraw();

        document.querySelectorAll('.tool-panel .button').forEach(btn => {
            btn.style.background = 'rgba(71, 85, 105, 0.8)';
        });

        const toolBtn = document.getElementById(tool + 'Tool');
        if (toolBtn) {
            toolBtn.style.background = 'linear-gradient(45deg, #8b5cf6, #7c3aed)';
        }
    },

    reset() {
        this.shapes = [];
        this.selectedShape = null;
        this.undoStack = [];
        this.redraw();
        document.getElementById('shapeName').value = '';
    },

    clear() {
        this.saveToUndoStack();
        this.reset();
    },

    undo() {
        if (this.undoStack.length > 0) {
            this.shapes = this.undoStack.pop();
            this.redraw();
        } else {
            Designer.showNotification('Nothing to undo', 'info');
        }
    },

    saveToUndoStack() {
        this.undoStack.push([...this.shapes]);
        if (this.undoStack.length > 20) {
            this.undoStack.shift();
        }
    },

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentTool === 'select') {
            this.selectShapeAt(x, y);
        } else {
            this.saveToUndoStack();
            this.startDrawing(x, y);
        }
    },

    onMouseMove(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.updateCurrentShape(x, y);
        this.redraw();
    },

    onMouseUp(e) {
        if (this.isDrawing) {
            this.finishDrawing();
        }
    },

    startDrawing(x, y) {
        this.isDrawing = true;

        const shape = {
            type: this.currentTool,
            startX: x,
            startY: y,
            endX: x,
            endY: y,
            color: '#6b7280'
        };

        this.shapes.push(shape);
    },

    updateCurrentShape(x, y) {
        if (this.shapes.length > 0) {
            const currentShape = this.shapes[this.shapes.length - 1];
            currentShape.endX = x;
            currentShape.endY = y;
        }
    },

    finishDrawing() {
        this.isDrawing = false;
        if (this.shapes.length > 0) {
            const lastShape = this.shapes[this.shapes.length - 1];
            const width = Math.abs(lastShape.endX - lastShape.startX);
            const height = Math.abs(lastShape.endY - lastShape.startY);

            if (width < 3 && height < 3) {
                this.shapes.pop();
            }
        }
        this.redraw();
    },

    selectShapeAt(x, y) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (this.isPointInShape(x, y, shape)) {
                this.selectedShape = shape;
                this.redraw();
                return;
            }
        }
        this.selectedShape = null;
        this.redraw();
    },

    isPointInShape(x, y, shape) {
        const minX = Math.min(shape.startX, shape.endX);
        const maxX = Math.max(shape.startX, shape.endX);
        const minY = Math.min(shape.startY, shape.endY);
        const maxY = Math.max(shape.startY, shape.endY);

        const tolerance = 5;
        return x >= minX - tolerance && x <= maxX + tolerance &&
               y >= minY - tolerance && y <= maxY + tolerance;
    },

    redraw() {
        if (!this.ctx || !this.canvas) {
            console.warn('Canvas not available for redraw');
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();

        this.shapes.forEach(shape => {
            this.drawShape(shape, shape === this.selectedShape);
        });
    },

    drawGrid() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.strokeStyle = 'rgba(107, 114, 128, 0.2)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    },

    drawShape(shape, isSelected = false) {
        if (!this.ctx) return;

        this.ctx.strokeStyle = isSelected ? '#9ca3af' : shape.color;
        this.ctx.fillStyle = shape.color + '20';
        this.ctx.lineWidth = isSelected ? 3 : 2;

        const width = shape.endX - shape.startX;
        const height = shape.endY - shape.startY;

        this.ctx.beginPath();

        switch (shape.type) {
            case 'rectangle':
                this.ctx.rect(shape.startX, shape.startY, width, height);
                this.ctx.fill();
                this.ctx.stroke();
                break;

            case 'circle':
                const radius = Math.sqrt(width * width + height * height) / 2;
                const centerX = shape.startX + width / 2;
                const centerY = shape.startY + height / 2;
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                break;

            case 'line':
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                break;
        }
    },

    loadTemplate(templateType) {
        this.saveToUndoStack();
        this.clear();

        const templates = {
            vibratory: [
                { type: 'rectangle', startX: 50, startY: 150, endX: 350, endY: 200, color: '#6b7280' },
                { type: 'rectangle', startX: 75, startY: 125, endX: 325, endY: 150, color: '#9ca3af' },
                { type: 'rectangle', startX: 100, startY: 200, endX: 300, endY: 225, color: '#9ca3af' }
            ],
            belt: [
                { type: 'rectangle', startX: 50, startY: 150, endX: 350, endY: 200, color: '#6b7280' },
                { type: 'circle', startX: 60, startY: 160, endX: 80, endY: 180, color: '#9ca3af' },
                { type: 'circle', startX: 320, startY: 160, endX: 340, endY: 180, color: '#9ca3af' }
            ],
            screw: [
                { type: 'rectangle', startX: 50, startY: 175, endX: 350, endY: 200, color: '#6b7280' },
                { type: 'line', startX: 75, startY: 160, endX: 325, endY: 160, color: '#9ca3af' },
                { type: 'line', startX: 75, startY: 215, endX: 325, endY: 215, color: '#9ca3af' }
            ],
            hopper: [
                { type: 'rectangle', startX: 100, startY: 50, endX: 300, endY: 120, color: '#6b7280' },
                { type: 'line', startX: 100, startY: 120, endX: 150, endY: 200, color: '#6b7280' },
                { type: 'line', startX: 300, startY: 120, endX: 250, endY: 200, color: '#6b7280' },
                { type: 'line', startX: 150, startY: 200, endX: 250, endY: 200, color: '#6b7280' },
                { type: 'rectangle', startX: 175, startY: 200, endX: 225, endY: 250, color: '#9ca3af' },
                { type: 'circle', startX: 190, startY: 220, endX: 210, endY: 240, color: '#4b5563' }
            ]
        };

        if (templates[templateType]) {
            this.shapes = templates[templateType].map(t => ({...t}));
            this.redraw();
            document.getElementById('shapeName').value = `Custom ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`;
        }
    },

    saveShape() {
        const name = document.getElementById('shapeName').value.trim();
        if (!name) {
            Designer.showNotification('Please enter a shape name', 'error');
            return;
        }

        if (this.shapes.length === 0) {
            Designer.showNotification('Please draw some shapes first', 'error');
            return;
        }

        const svg = this.generateSVG();

        const shapeData = {
            name: name,
            type: 'ia.display.symbol',
            icon: '*',
            props: {
                path: `custom/${name.toLowerCase().replace(/\s+/g, '_')}`,
                customShape: true
            },
            size: [200, 150],
            svg: svg,
            shapes: [...this.shapes]
        };

        Designer.addCustomShape(shapeData);
        Designer.closeShapeEditor();
    },

    generateSVG() {
        const bounds = this.calculateBounds();
        const width = bounds.maxX - bounds.minX + 20;
        const height = bounds.maxY - bounds.minY + 20;

        let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">`;

        this.shapes.forEach(shape => {
            const offsetX = -bounds.minX + 10;
            const offsetY = -bounds.minY + 10;

            switch (shape.type) {
                case 'rectangle':
                    const w = shape.endX - shape.startX;
                    const h = shape.endY - shape.startY;
                    svg += `<rect x="${shape.startX + offsetX}" y="${shape.startY + offsetY}" width="${w}" height="${h}" fill="currentColor" stroke="#9ca3af"/>`;
                    break;

                case 'circle':
                    const radius = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2)) / 2;
                    const cx = shape.startX + (shape.endX - shape.startX) / 2 + offsetX;
                    const cy = shape.startY + (shape.endY - shape.startY) / 2 + offsetY;
                    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="currentColor" stroke="#9ca3af"/>`;
                    break;

                case 'line':
                    svg += `<line x1="${shape.startX + offsetX}" y1="${shape.startY + offsetY}" x2="${shape.endX + offsetX}" y2="${shape.endY + offsetY}" stroke="#9ca3af" stroke-width="2"/>`;
                    break;
            }
        });

        svg += '</svg>';
        return svg;
    },

    calculateBounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        this.shapes.forEach(shape => {
            minX = Math.min(minX, shape.startX, shape.endX);
            minY = Math.min(minY, shape.startY, shape.endY);
            maxX = Math.max(maxX, shape.startX, shape.endX);
            maxY = Math.max(maxY, shape.startY, shape.endY);
        });

        return { minX, minY, maxX, maxY };
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    Designer.init();
});
