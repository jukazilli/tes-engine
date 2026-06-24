import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    depConstraints: [
                        {
                            sourceTag: "scope:frontend",
                            onlyDependOnLibsWithTags: [
                                "scope:frontend",
                                "scope:shared"
                            ]
                        },
                        {
                            sourceTag: "scope:backend",
                            onlyDependOnLibsWithTags: [
                                "scope:backend",
                                "scope:shared",
                                "scope:engine"
                            ]
                        },
                        {
                            sourceTag: "scope:engine",
                            onlyDependOnLibsWithTags: [
                                "scope:engine",
                                "scope:shared"
                            ]
                        },
                        {
                            sourceTag: "scope:shared",
                            onlyDependOnLibsWithTags: [
                                "scope:shared"
                            ]
                        },
                        {
                            sourceTag: "type:contracts",
                            onlyDependOnLibsWithTags: [
                                "type:contracts",
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:util",
                            notDependOnLibsWithTags: [
                                "type:app",
                                "type:feature",
                                "type:ui"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
