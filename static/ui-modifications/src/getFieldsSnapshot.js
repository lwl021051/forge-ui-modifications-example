function getFieldData(field) {
    return {
        type: field.getType(),
        name: field.getName(),
        value: field.getValue(),
        optionsVisibility: field.getOptionsVisibility?.(),
        description:field.getDescription(),
        isVisible: field.isVisible(),
        isReadOnly: field.isReadOnly(),
        isRequired: field.isRequired?.(),
    };
}

export function getFieldsSnapshot({ getFields }) {
    return getFields().reduce((acc, field) => {
        acc[field.getId()] = getFieldData(field);

        return acc;
    }, {});
}
