
(function () {
    // admin.js code block

    document.addEventListener("DOMContentLoaded", function () {
        let list = document.querySelectorAll(".navigation-list li");

        function activeLink() {
            list.forEach((item) => {
                item.classList.remove("hovered");
            });
            this.classList.add("hovered");
        }

        list.forEach((item) => item.addEventListener("mouseover", activeLink));

        let toggle = document.querySelector(".toggle");
        let navigation = document.querySelector(".navigation-list");
        let main = document.querySelector(".main");

        toggle.onclick = function () {
            navigation.classList.toggle("active");
            main.classList.toggle("active");
        };
    });

})();

(function () {
    // main.js code block
    const navBtn = document.getElementById("nav-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const sideNav = document.getElementById("sidenav");
    const modal = document.getElementById("modal");

    window.addEventListener("DOMContentLoaded", () => {
        // Your JavaScript code here
        document.querySelector(".card-number-input").oninput = () => {
            document.querySelector(".card-number-box").innerText = document.querySelector(".card-number-input").value;
        };

        document.querySelector(".card-holder-input").oninput = () => {
            document.querySelector(".card-holder-name").innerText = document.querySelector(".card-holder-input").value;
        };

        document.querySelector(".month-input").oninput = () => {
            document.querySelector(".exp-month").innerText = document.querySelector(".month-input").value;
        };

        document.querySelector(".year-input").oninput = () => {
            document.querySelector(".exp-year").innerText = document.querySelector(".year-input").value;
        };

        document.querySelector(".cvv-input").onmouseenter = () => {
            document.querySelector(".front").style.transform = "perspective(1000px) rotateY(-180deg)";
            document.querySelector(".back").style.transform = "perspective(1000px) rotateY(0deg)";
        };

        document.querySelector(".cvv-input").onmouseleave = () => {
            document.querySelector(".front").style.transform = "perspective(1000px) rotateY(0deg)";
            document.querySelector(".back").style.transform = "perspective(1000px) rotateY(180deg)";
        };

        document.querySelector(".cvv-input").oninput = () => {
            document.querySelector(".cvv-box").innerText = document.querySelector(".cvv-input").value;
        };
    });

    navBtn.addEventListener("click", function () {
        sideNav.classList.add("show");
        modal.classList.add("showModal");
    });

    cancelBtn.addEventListener("click", function () {
        sideNav.classList.remove("show");
        modal.classList.remove("showModal");
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            sideNav.classList.remove("show");
            modal.classList.remove("showModal");
        }
    });

    const btn = document.querySelector(".read-more-btn");
    const text = document.querySelector(".card__read-more");
    const cardHolder = document.querySelector(".services-container");

    cardHolder.addEventListener("click", (e) => {
        const current = e.target;
        const isReadMoreBtn = current.className.includes("read-more-btn");
        if (!isReadMoreBtn) return;
        const currentText = e.target.parentNode.querySelector(".card__read-more");
        currentText.classList.toggle("card__read-more--open");
        current.textContent = current.textContent.includes("Read More...") ? "Read Less..." : "Read More...";
    });

    document.addEventListener("DOMContentLoaded", function () {
        const readMoreBtn = document.querySelector(".read-more-btnn");
        const readMoreText = document.querySelector(".card__read-moree");

        readMoreBtn.addEventListener("click", function () {
            if (readMoreText.style.display === "none") {
                readMoreText.style.display = "inline";
                readMoreBtn.innerText = "Read Less...";
            } else {
                readMoreText.style.display = "none";
                readMoreBtn.innerText = "Read More...";
            }
        });
    });
})();








