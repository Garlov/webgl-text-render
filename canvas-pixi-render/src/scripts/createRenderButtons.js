export default function createRenderButtons() {
    let buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.top = '0px';
    buttonContainer.style.left = '0px';
    buttonContainer.style.width = '100px';
    buttonContainer.style.height = window.innerHeight;

    let normalRenderButton = document.createElement('button');
    normalRenderButton.setAttribute('id', 'normal-render');
    normalRenderButton.innerText = 'Normal Render';
    normalRenderButton.style.width = '100%';

    let directRenderButton = document.createElement('button');
    directRenderButton.setAttribute('id', 'direct-render');
    directRenderButton.innerText = 'Direct Render';
    directRenderButton.style.width = '100%';

    buttonContainer.appendChild(normalRenderButton);
    buttonContainer.appendChild(directRenderButton);

    document.body.appendChild(buttonContainer);
}