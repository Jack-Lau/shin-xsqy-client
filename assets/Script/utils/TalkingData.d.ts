declare module TDGA {
    export function Account(obj: any);

    export function onChargeRequest(obj: any);

    export function onChargeSuccess(obj: any);

    export function onEvent(eventId, eventData); 
}