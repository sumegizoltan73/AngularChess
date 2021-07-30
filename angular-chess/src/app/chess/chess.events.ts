import { EventEmitter } from "@angular/core";

class TypifiedEventEmitter {
    type: string; 
    eventEmitter: EventEmitter<any>;

    constructor(private _type: string) {
        this.type = _type;
        this.eventEmitter = new EventEmitter<any>();
    }
}

export class ChessEvents {

    private eventEmitterList: TypifiedEventEmitter[] = [];

    constructor(){

    }

    subscribe(type: string, complete: ((eventArgs?: any) => void)): void {
        let e = this.getEventEmitter(type);
        if (!e) {
            e = new TypifiedEventEmitter(type);
            this.eventEmitterList.push(e);
        }

        e.eventEmitter.subscribe(complete);
    }

    emit(type: string, eventArgs?: any): void {
        let e = this.getEventEmitter(type);
        if (e) {
            e.eventEmitter.emit(eventArgs);
        }
    }

    private getEventEmitter(type: string): TypifiedEventEmitter | undefined {
        let _retVal = undefined;

        for (let i = 0; i < this.eventEmitterList.length; i++) {
            const element = this.eventEmitterList[i];
            if (element.type === type) {
                _retVal = element;
                break;
            }
        }
        return _retVal;
    }
}