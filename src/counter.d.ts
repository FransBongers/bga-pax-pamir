interface Counter {
    speed: number; // duration of the animation, default is 100ms
    create: (nodeId: string) => void; //  associate counter with existing target DOM element
    getValue: () => number; //  return current value
    incValue: (by: number) => void; //  increment value by "by" and animate from previous value
    setValue: (value: number) => void; //  set value, no animation
    toValue: (value: number) => void; // set value with animation
    disable: () => void; // Sets value to "-"
}