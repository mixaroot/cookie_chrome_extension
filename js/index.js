(function () {

    /**
     * Work with hml
     * @constructor
     */
    function WorkWithHtml() {
        this.cookieName = '';
        this.cookieValue = '';
        this.cookieDomains = [];
        this.set = function (data) {
            if (data.values.cookieName) {
                document.getElementById("cookieName").value = data.values.cookieName;
            }
            if (data.values.cookieValue) {
                document.getElementById("cookieValue").value = data.values.cookieValue;
            }
            if (data.values.cookieDomains) {
                document.getElementById("domains").value = data.values.cookieDomains.join("\n");
            }
        };
        this.getCookieName = function () {
            this.cookieName = document.getElementById("cookieName").value;
            return this;
        };
        this.getCookieValue = function () {
            this.cookieValue = document.getElementById("cookieValue").value;
            return this;
        };
        this.getDomains = function () {
            var dirtyDomains = document.getElementById('domains').value;
            this.cookieDomains = dirtyDomains.split(/\n|\r|\t|\s/).filter(Boolean);
            for (var i = 0; i < this.cookieDomains.length; i++) {
                var newDomain = this.cookieDomains[i].match(/^(https?\:\/\/)?(.+?)(\/.*)?$/i);
                if (newDomain[2]) {
                    this.cookieDomains[i] = newDomain[2];
                }
            }
            this.cookieDomains = this.uniqueArray(this.cookieDomains);
            return this;
        };
        this.uniqueArray = function (data) {
            return data.filter(function (elem, pos) {
                return data.indexOf(elem) == pos;
            });
        };
        this.clearErrors = function () {
            document.getElementById("cookieNameError").innerHTML = '';
            document.getElementById("cookieValueError").innerHTML = '';
            document.getElementById("domainsError").innerHTML = '';
        };
        this.clearHtml = function () {
            document.getElementById("cookieName").value = '';
            document.getElementById("cookieValue").value = '';
            document.getElementById("domains").value = '';
        };
        this.renderErrors = function (errorCookieName, errorCookieValue, errorDomains) {
            if (errorCookieName) {
                document.getElementById("cookieNameError").innerHTML = errorCookieName;
            }
            if (errorCookieValue) {
                document.getElementById("cookieValueError").innerHTML = errorCookieValue;
            }
            if (errorDomains) {
                document.getElementById("domainsError").innerHTML = errorDomains;
            }
        };
        this.setInformation = function (value) {
            document.getElementById("information").innerHTML = value;
            setTimeout(function () {
                document.getElementById("information").innerHTML = '';
            }, 3000);
        }
    }

    /**
     * All validation
     * @constructor
     */
    function Validation() {
        const maxLengthCookieName = 25;
        const errorMaxLengthCookieName = 'Cookie name must be shorter than ' + maxLengthCookieName;
        const minLengthCookieName = 1;
        const errorMinLengthCookieName = 'Cookie name must be longer than ' + minLengthCookieName;

        const maxLengthCookieValue = 100;
        const errorMaxLengthCookieValue = 'Cookie value must be shorter than ' + maxLengthCookieValue;
        const minLengthCookieValue = 1;
        const errorMinLengthCookieValue = 'Cookie value must be longer than ' + minLengthCookieValue;

        const maxDomains = 200;
        const maxDomainError = 'Domains can not be more ' + maxDomains;

        const errorDomains = 'Wrong domains: ';
        const errorEmptyDomain = 'Empty domains';

        this.errorCookieName = '';
        this.errorCookieValue = '';
        this.errorDomains = '';
        this.cookieName = function (cookieName) {
            if (cookieName.length < minLengthCookieName) {
                this.errorCookieName = errorMinLengthCookieName;
            } else if (cookieName.length > maxLengthCookieName) {
                this.errorCookieName = errorMaxLengthCookieName;
            }
            return this
        };
        this.cookieValue = function (cookieValue) {
            if (cookieValue.length < minLengthCookieValue) {
                this.errorCookieValue = errorMinLengthCookieValue;
            } else if (cookieValue.length > maxLengthCookieValue) {
                this.errorCookieValue = errorMaxLengthCookieValue;
            }
            return this
        };
        this.isDomain = function (domain) {
            if (domain.search(/^[a-zA-Z0-9][a-zA-Z0-9-.]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/i) != -1) {
                return true;
            }
            return false;
        }
        this.domains = function (domains) {
            if (domains.length == 0) {
                this.errorDomains = errorEmptyDomain;
                return this;
            }
            if (domains.length > maxDomains) {
                this.errorDomains = maxDomainError;
                return this;
            }
            var wrongDomains = [];
            for (var i = 0; i < domains.length; i++) {
                if (!this.isDomain(domains[i])) {
                    wrongDomains[i] = domains[i];
                }
            }
            if (wrongDomains.length != 0) {
                this.errorDomains = errorDomains + wrongDomains.join(' ');
            }
            return this
        };
        this.clearErrors = function () {
            this.errorCookieName = '';
            this.errorCookieValue = '';
            this.errorDomains = '';
            return this;
        }
    }

    /**
     * Work with cookie
     * @constructor
     */
    function Cookie() {
        this.setCookieForDomains = function (cookieName, cookieValue, cookieDomains) {
            for (var i = 0; i < cookieDomains.length; i++) {
                this.set('http://' + cookieDomains[i], cookieName, cookieValue, '.' + cookieDomains[i]);
                this.set('https://' + cookieDomains[i], cookieName, cookieValue, '.' + cookieDomains[i]);
            }
        };
        this.clearCookie = function (cookieName, cookieDomains) {
            for (var i = 0; i < cookieDomains.length; i++) {
                this.remove('http://' + cookieDomains[i], cookieName);
                this.remove('https://' + cookieDomains[i], cookieName);
            }
        };
        this.set = function (url, name, value, domain, expirationDate) {
            if (!expirationDate) {
                expirationDate = Math.ceil(Date.now() / 1000) + (60 * 60 * 24 * 365);
            } else {
                expirationDate = Math.ceil(Date.now() / 1000) + expirationDate;
            }
            chrome.cookies.set({
                url: url,
                name: name,
                value: value,
                domain: domain,
                path: '/',
                secure: false,
                httpOnly: false,
                sameSite: 'no_restriction',
                expirationDate: expirationDate
            }, function (result) {
                //console.log(result);
            });
        };
        this.remove = function (url, name) {
            chrome.cookies.remove({
                url: url,
                name: name
            }, function (result) {
                //console.log(result);
            });
        };
    }

    /**
     * Work with storage
     * @constructor
     */
    function MyStorage() {
        this.set = function (cookieName, cookieValue, cookieDomains) {
            chrome.storage.local.set({
                values: {
                    cookieName: cookieName,
                    cookieValue: cookieValue,
                    cookieDomains: cookieDomains
                }
            }, function (error) {
                //error);
            });
        };
        this.remove = function () {
            chrome.storage.local.remove('values', function (error) {
                //console.log(error);
            });
        };
        this.get = function (func) {
            chrome.storage.local.getBytesInUse('values', function (bytes) {
                if (bytes) {
                    chrome.storage.local.get('values', func);
                }
            });
        };
    }

    /**
     * Add all handlers
     * @constructor
     */
    function Handlers() {
        this.init = function (workWithHtml, validation, myStorage, cookie) {
            this.save(workWithHtml, validation, myStorage, cookie);
            this.clear(workWithHtml, myStorage, cookie);
            this.help();
        };
        this.help = function () {
            document.getElementById('help').onclick = function (e) {
                if (document.getElementById('helpText').style.display === 'block') {
                    document.getElementById('helpText').style.display = 'none';
                } else {
                    document.getElementById('helpText').style.display = 'block';
                }
            }
        };
        this.save = function (workWithHtml, validation, myStorage, cookie) {
            document.getElementById('save').onclick = function (e) {
                workWithHtml.getCookieName()
                    .getCookieValue()
                    .getDomains();
                validation.clearErrors()
                    .cookieName(workWithHtml.cookieName)
                    .cookieValue(workWithHtml.cookieValue)
                    .domains(workWithHtml.cookieDomains);

                console.log(workWithHtml.cookieDomains);

                workWithHtml.clearErrors();
                if (validation.errorCookieName || validation.errorCookieValue || Object.keys(validation.errorDomains).length != 0) {
                    workWithHtml.renderErrors(validation.errorCookieName, validation.errorCookieValue, validation.errorDomains);
                } else {
                    myStorage.set(workWithHtml.cookieName, workWithHtml.cookieValue, workWithHtml.cookieDomains);
                    cookie.setCookieForDomains(workWithHtml.cookieName, workWithHtml.cookieValue, workWithHtml.cookieDomains);
                    workWithHtml.setInformation('Save cookie for all domains');
                    myStorage.get(workWithHtml.set);
                }
            }
        };
        this.clear = function (workWithHtml, myStorage, cookie) {
            document.getElementById('clear').onclick = function (e) {
                workWithHtml.getCookieName()
                    .getCookieValue()
                    .getDomains();
                cookie.clearCookie(workWithHtml.cookieName, workWithHtml.cookieDomains);
                myStorage.remove();
                workWithHtml.clearHtml();
                workWithHtml.setInformation('Clear cookie for all domains');
            }
        };
    }

    /**
     * Main function
     * @constructor
     */
    function Main() {
        this.init = function () {
            var workWithHtml = new WorkWithHtml();
            var validation = new Validation();
            var myStorage = new MyStorage();
            var cookie = new Cookie();

            var handlers = new Handlers();
            handlers.init(workWithHtml, validation, myStorage, cookie);

            myStorage.get(workWithHtml.set);
        }
    }

    /**
     * Initialization extension
     */
    window.onload = function () {
        var main = new Main();
        main.init();
    };
})();