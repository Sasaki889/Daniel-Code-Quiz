
const eutil = {}
const defaultElementStates = {}


eutil.addToPropertyCache = function(element, settings) {
    let writePath = {}
    let readPath = element;

    
function deepSearch(currentPath) {
        for (let key in currentPath) {
            let value = currentPath[key];
            const valueStyle = key === "style" ? getComputedStyle(element) : readPath[key]; 
            const typeofValue = typeof value;

            if (typeofValue === "object" && typeofValue != null && typeofValue != undefined) {
                writePath[key] = {}                 
                const prevWritePath = writePath;    
                const prevReadPath = readPath;
                writePath = writePath[key];         
                readPath = valueStyle;

                deepSearch(value);                  

                readPath = prevReadPath;            
                writePath = prevWritePath;
            } else {
                writePath[key] = valueStyle;        
            }
        }
    }

    
    deepSearch(settings);
    defaultElementStates[element] = writePath;

    
    return writePath;
}

eutil.getPropertyCache = function(element, attribute) {
    return attribute ? defaultElementStates[element][attribute] : defaultElementStates[element];
}

eutil.hideElement = function(element, keepInFlow) {
    if (keepInFlow) {
        element.style.visibility = "hidden";
    } else {
        element.style.display = "none";
    }
}

eutil.showElement = function(element) {
    element.style.visibility = "visible"
    element.style.display = this.getPropertyCache(element, "style").display;
}

eutil.clearChildrenOnElement = function(element) {
    let children = element.children;
    for (let i = children.length - 1; i >= 0; i--) {
        children[i].remove();
    }
}

eutil.generateDynamicText = function($parent, data) {
    this.clearChildrenOnElement($parent);

    
    for (let i = 0; i < data.length; i++) {
        const info = data[i];
        const $subtext = document.createElement("span");

        $subtext.textContent = info.content;
        if (info.style) $subtext.setAttribute("style", info.style);

        $parent.append($subtext);
    }

    
    return $parent.children;
}


export default eutil;
