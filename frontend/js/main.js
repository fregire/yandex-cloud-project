"use strict";

const adsListElement = document.querySelector(".ads-list");
const API_BASE_URL = 'https://bbannd7cjvcj7o023029.containers.yandexcloud.net';
const loader = document.querySelector('.loader');
const adsAddForm = document.querySelector('.ads-add-form');
const frontendVersionSpan = document.querySelector('.frontend-version');
const backendVersionSpan = document.querySelector('.backend-version');
const backendNameSpan = document.querySelector('.backend-name');

function initVersions(){
    if (typeof FRONTEND_VERSION !== 'undefined') {
        frontendVersionSpan.textContent = FRONTEND_VERSION;
    }

    fetch(`${API_BASE_URL}/version`, { method: 'GET' })
        .then(response => response.json())
        .then(version => {
            let backendVersion = version[0];
            let backendName = version[1];
            backendVersionSpan.textContent = backendVersion;
            backendNameSpan.textContent = backendName;
        })
}

initVersions();

async function addAd(title, content, images) {
    let response = await fetch(`${API_BASE_URL}/ads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({images: images, text: content, title: title})
    });
    let result = await response.json();

    return result;
}

function submitAdsAddFormHandler(e) {
    e.preventDefault();
    const form = e.target;
    const formFields = form.elements;
    const fieldsToClear = [formFields.title, formFields.text];
    const title = formFields.title.value;
    const content = formFields.text.value;
    const images = formFields.images.value.split(",");

    addAd(title, content, images)
        .then((res) => {
            let adItem = createAdItem(images, content, title);
            adsListElement.appendChild(adItem);
            fieldsToClear.forEach(field => {
                field.value = "";
            })
        })
}

adsAddForm.addEventListener("submit", submitAdsAddFormHandler);

function createImages(images) {
    let imagesContainer = document.createElement('div');
    imagesContainer.classList.add("ads-item-images");

    images.forEach(imageLink => {
        let img = document.createElement('img');
        img.src = 'placeholder.jpg';
        img.title = imageLink;
        img.width = 100;
        img.height = 100;
        imagesContainer.appendChild(img);
    });

    return imagesContainer;
};

function createAdItem(images, text, title){
    let li = document.createElement('li');
    let h2 = document.createElement('h2');
    let p = document.createElement('p');
    let imagesElements = createImages(images);

    li.classList.add("ads-item");
    h2.textContent = title;
    p.textContent = text;

    li.appendChild(imagesElements);
    li.appendChild(h2);
    li.appendChild(p);

    return li;
};   

async function initAdsList() {
    let response = await fetch(`${API_BASE_URL}/ads`, {
        method: 'GET'
    });
    let result = await response.json();

    return result;
}

initAdsList().then((res) => {
    res.forEach(ad => {
        let adItem = createAdItem(ad.images, ad.title, ad.text);
        adsListElement.appendChild(adItem);
        loader.classList.add('disabled');
    });
});