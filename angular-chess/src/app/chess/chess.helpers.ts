/// <reference path="./string.d.ts" />

String.prototype.toUpperCaseFirstLetter = function(): string { 
    let str = '';

    if (this.length > 0) {
        if (this.length > 1) {
            str = this.substr(0, 1).toUpperCase() + this.substr(1, this.length - 1);
        }
        else {
            str = this.toUpperCase();
        }
    }

    return str;
};