import { view, requestJira } from '@forge/bridge';
import { uiModificationsApi } from '@forge/jira-bridge';
import { getFieldsSnapshot } from './getFieldsSnapshot';

const log = console.log;
console.log = (...args) => {
    log('UI modifications app,', ...args);
};

const isIssueView = (viewType) => viewType === "IssueView";

// Context usage
view.getContext().then((context) => {
    const { extension } = context;
    console.log('Context:');
    const issue = extension.issue ?? { id: undefined, key: undefined };
    console.table({ project: extension.project, issueType: extension.issueType, issue: issue });
    console.table({ viewType: extension.viewType});
});

const { onInit, onChange } = uiModificationsApi;

const onInitCallback = async ({ api, uiModifications }) => {
    const { getFieldById, getFields } = api;
    const { extension: { viewType } }  = await view.getContext();
    // Hiding the priority field
    const priority = getFieldById('priority');
    priority?.setVisible(false);

    // Changing the summary field label
    const summary = getFieldById('summary');
    summary?.setName('Modified summary label');
    // Changing the value of the summary field, only on Issue view
    if (isIssueView(viewType)) {
        summary?.setValue('Modified summary value');
    }

    // Changing the assignee field description and name
    const assignee = getFieldById('assignee');
    assignee?.setDescription('Description added by UI modifications');
    assignee?.setName('Name of the assignee changed by UI modifications');

    // Changing the name of description field
    const description = getFieldById('description');
    description?.setName("Modified description name");
    // Changing the value of the description field, only on Issue view
    if (isIssueView(viewType)) {
        description?.setValue({
            version: 1,
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'Modified description value',
                        },
                    ],
                },
               
            ],
        });
    }

    console.log('Fields Snapshot:');
    console.table(getFieldsSnapshot({ getFields }));

    // Here we read the data that can be set when creating the UI modifications context
    // This is preferred method of making small customizations to adapt your UI modifications to different projects and issue types
    uiModifications.forEach((uiModification) => {
        console.log(`Data for UI modification ID ${uiModification.id}`, uiModification.data);
    });

    // Return a Promise to apply changes after resolve.
    return new Promise(async (resolve) => {
        // Example Product API call, lists all the projects before applying the UIM changes
        const result = await requestJira('/rest/api/3/project');
        console.log('API call result:', { status: result.status, projects: await result.json() });
        resolve();
    });
};

onInit(onInitCallback, () => {
    return ['summary', 'assignee', 'description', 'priority'];
});

const onChangeCallback = ({ api, change, uiModifications }) => {
    // The `change.current` property provides access
    // to the field which triggered the change
    const id = change.current.getId();

    // The UI modifications data is also present in the onChange callback
    uiModifications.forEach((uiModification) => {
        console.log(`Data for UI modification ID ${uiModification.id}`, uiModification.data);
    });

    // Checking if the change event was triggered by the `summary` field
    if (id === 'summary') {
        // Logging the current `summary` field value
        const value = change.current.getValue();
        console.log(`The ${id} field value is: ${value}`);

        // Updating the `summary` field description
        change.current.setDescription(`The ${id} field was updated at: ${new Date().toString()}`);

        // Showing the priority field (keep in mind the onInitCallback hides it)
        api.getFieldById('priority')?.setVisible(true);

        // Delaying changes application
        const delay = 3000;
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Changes applied after ${delay}ms delay`);
                resolve();
            }, delay);
        });
    }
};

onChange(onChangeCallback, () => ['summary', 'priority']);
