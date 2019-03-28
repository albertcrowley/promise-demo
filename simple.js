function calc_pi_sync(count) {
    let inside = 0;

    for (let i = 0; i < count; i++) {
        let x = Math.random()*2-1;
        let y = Math.random()*2-1;
        if ((x*x + y*y) < 1) {
            inside++
        }
    }

    return 4.0 * inside / count;
}
//
// calc_pi_sync(80000)
// calc_pi_sync(40000)
// calc_pi_sync(20000)
// calc_pi_sync(10000)
// calc_pi_sync(1000)
// calc_pi_sync(100)
// calc_pi_sync(10)


function calc_pi_async(count) {

    return new Promise( function(resolve, reject) {
        setTimeout( function() {
            let inside = 0
            for (let i = 0; i < count; i++) {
                let x = Math.random()*2-1;
                let y = Math.random()*2-1;
                if ((x*x + y*y) < 1) {
                    inside++
                }
            }
            resolve (4.0 * inside / count);
        }, 2000)
    })
}

let p1 = calc_pi_async(10000)
let p2 = calc_pi_async(10000)
let p3 = calc_pi_async(10000)
let p4 = calc_pi_async(10000)

console.log (p1)

p1.then( pi => console.log("pi is ", pi))
p2.then( pi => console.log("pi is ", pi))
p3.then( pi => console.log("pi is ", pi))
p4.then( pi => console.log("pi is ", pi))


// p1.then( pi => {
//     console.log("pi is ", pi)
//     console.log("TEST", Promise.resolve(p1))
//     p1.then( () => {console.log ("still got a then")})
// })




//
// function calc_pi_async2(count, result_idx, inside=0, i=0 ) {
//     let loops = 0
//     for ( ; i < count && loops < 1000 ; i++, loops++) {
//         let x = Math.random()*2-1;
//         let y = Math.random()*2-1;
//         if ((x*x + y*y) < 1) {
//             inside++
//         }
//     }
//     if (i == count) {
//        results[result_idx] = 4.0 * inside / i;
//        done++;
//     } else {
//         results[result_idx] = 4.0 * inside / i;
//         setTimeout(() => calc_pi_async2(count, result_idx, inside, i), 10)
//     }
//
// }
//
// let results = []
// let done = 0
//
// calc_pi_async2(5000000,0)
// calc_pi_async2(1000000,1)
// calc_pi_async2(100000,2)
// calc_pi_async2(10000,3)
// calc_pi_async2(1000,4)
// calc_pi_async2(100,5)
// calc_pi_async2(10,6)
//
// function print_results() {
//     console.log (results, "finished", done)
//     if (done < 7) {
//         setTimeout(print_results, 1000)
//     }
// }
//
// print_results()
