// (C) 2021 GoodData Corporation
import { ActionOptions, TargetAppFlavor, TargetBackendType } from "../_base/types";
import {
    backendTypeValidator,
    flavorValidator,
    createHostnameValidator,
    pluginNameValidator,
    validOrDie,
} from "../_base/cli/validators";
import { promptBackend, promptFlavor, promptHostname, promptName } from "../_base/cli/prompts";

function getHostname(backend: TargetBackendType | undefined, options: ActionOptions): string | undefined {
    const { hostname } = options.programOpts;

    if (!hostname) {
        return undefined;
    }

    // do the hostname validation only if the backend type is known at this point
    if (backend !== undefined) {
        validOrDie("hostname", hostname, createHostnameValidator(backend));
    }

    return hostname;
}

function getBackend(options: ActionOptions): TargetBackendType | undefined {
    const { backend } = options.commandOpts;

    if (!backend) {
        return undefined;
    }

    validOrDie("backend", backend, backendTypeValidator);

    return backend as TargetBackendType;
}

function getFlavor(options: ActionOptions): TargetAppFlavor | undefined {
    const { flavor } = options.commandOpts;

    if (!flavor) {
        return undefined;
    }

    validOrDie("flavor", flavor, flavorValidator);

    return flavor as TargetAppFlavor;
}

//
//
//

export type InitCmdActionConfig = {
    name: string;
    backend: TargetBackendType;
    hostname: string;
    flavor: TargetAppFlavor;
    targetDir: string | undefined;
    skipInstall: boolean;
};

/**
 * This function will obtain configuration for the plugin init command. It will do so from the argument
 * and option values passed via CLI and in case vital input is missing by using interactive prompts.
 *
 * The function will first verify all the available options and only then start prompting the user - this
 * is intentional as the CLI should fail fast and not at some arbitrary point after user prompting.
 *
 * @param pluginName - plugin name (if any) as passed by the user, undefined means no plugin name on CLI
 * @param options - program & command level options provided by the user via CLI
 */
export async function getInitCmdActionConfig(
    pluginName: string | undefined,
    options: ActionOptions,
): Promise<InitCmdActionConfig> {
    if (pluginName) {
        validOrDie("plugin-name", pluginName, pluginNameValidator);
    }

    const backendFromOptions = getBackend(options);
    const hostnameFromOptions = getHostname(backendFromOptions, options);
    const flavorFromOptions = getFlavor(options);
    const backend = backendFromOptions ?? (await promptBackend());
    const hostname = hostnameFromOptions ?? (await promptHostname(backend));
    const flavor = flavorFromOptions ?? (await promptFlavor());
    const name = pluginName ?? (await promptName());

    // validate hostname once again; this is to catch the case when hostname is provided as
    // option but the backend is not and user is prompted for it. the user may select backend
    // for which the protocol used in the hostname is not valid (http on bear)
    validOrDie("hostname", hostname, createHostnameValidator(backend));

    return {
        name: name,
        backend,
        hostname,
        flavor,
        targetDir: options.commandOpts.targetDir,
        skipInstall: options.commandOpts.skipInstall ?? false,
    };
}