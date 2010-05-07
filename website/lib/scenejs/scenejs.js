// Define a "teapot" symbol, inside a namespace for fun.

SceneJS.name({name: "mySymbols"},

        SceneJS.symbol({
                name: "teapot"
            },
            SceneJS.objects.teapot()
        ),

        // Instance the teapot Symbol from inside the namespace.
        // See how the symbol reference is relative, where it
        // does not start with a '/'.

        SceneJS.translate({y : 10},
                SceneJS.instance({name: "teapot" })
        )
),

// Instance the teapot Symbol again, from outside the namespace

SceneJS.translate({y : 0},
     SceneJS.instance({name: "mySymbols/teapot"})
),

// Instance the teapot Symbol one more time from outside the
// namespace to show how an absolute path can be specified to
// the Symbol

SceneJS.translate({y : -10},
     SceneJS.instance({name: "/mySymbols/teapot"})
)

// ...