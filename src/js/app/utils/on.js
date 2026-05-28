import { arrayRemove } from '../../utils/arrayRemove';

const run = (cb, sync) => {
    if (sync) {
        cb();
    }
    else {
        // Use a microtask so destroy() finishes before the next mount.
        // setTimeout(cb, 0) schedules a macrotask, which on Safari bfcache
        // restore (and Turbolinks navigation) lets the next instance attach
        // before the previous one tears down, causing missing-target errors.
        Promise.resolve(1).then(cb);
    }
}

export const on = () => {
    const listeners = [];
    const off = (event, cb) => {
        arrayRemove(
            listeners,
            listeners.findIndex(
                listener => listener.event === event && (listener.cb === cb || !cb)
            )
        );
    };
    const fire = (event, args, sync) => {
        listeners
            .filter(listener => listener.event === event)
            .map(listener => listener.cb)
            .forEach(cb => run(() => cb(...args), sync));
    }
    return {
        fireSync: (event, ...args) => {
            fire(event, args, true);
        },
        fire: (event, ...args) => {
            fire(event, args, false);
        },
        on: (event, cb) => {
            listeners.push({ event, cb });
        },
        onOnce: (event, cb) => {
            listeners.push({
                event,
                cb: (...args) => {
                    off(event, cb);
                    cb(...args);
                }
            });
        },
        off
    };
};
