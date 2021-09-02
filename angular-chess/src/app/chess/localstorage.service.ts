import { Injectable } from "@angular/core";

@Injectable()
export class LocalStorageService {
    private _localStorage: Storage;

    constructor() {
        this._localStorage = localStorage;
    }

    setItem(name: string, data: any): void {
        if (data) {
            const jsonData = JSON.stringify(data);
            this._localStorage.setItem('angularchess_' + name, jsonData);
        }
    }

    loadItem(name: string): any {
        let data = undefined;
        const item = this._localStorage.getItem('angularchess_' + name);

        if (item) {
            data = JSON.parse(item);
        }

        return data;
    }

    getList(): IGameListItem[] {
        let _retVal: IGameListItem[] = [];

        for (var i = 0; i < this._localStorage.length; i++) {
            const element = this._localStorage.key(i);
            
            if (element!.indexOf('angularchess_') > -1) {
                const name = element!.replace('angularchess_', '');
                const item = this.loadItem(name);
                _retVal.push({
                    name: name,
                    date: item.date
                });
            }
        }

        return _retVal;
    }
}