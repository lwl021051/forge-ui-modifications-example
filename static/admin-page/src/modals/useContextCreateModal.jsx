import { useCallback, useState } from 'react';
import Modal, { ModalBody, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import { invokeUiModifications } from '../invokeUiModifications';
import Form, { FormFooter } from '@atlaskit/form';

import Button from '@atlaskit/button/standard-button';

import { ContextSelector } from '../components/ContextSelector';

export const createUimContext = (uiModification, data, setContextResult) => {
    return invokeUiModifications('PUT /rest/api/3/uiModifications/{uiModificationId}', {
        id: uiModification.id,
        body: {
            contexts: [
                ...uiModification.contexts.map((context) => ({
                    projectId: context.projectId,
                    issueTypeId: context.issueTypeId,
                    viewType: context.viewType,
                })),
                {
                    projectId: data.project.value,
                    issueTypeId: data.issueType.value,
                    viewType: data.viewType.value,
                },
            ],
        },
    }).then((data) => {
        if ('data' in data && data.data !== '') {
            data.data = JSON.parse(data.data);
        }

        setContextResult(JSON.stringify(data, null, 2));
    });
};

export function useContextCreateModal(currentUiModification, setUpdateTable, setContextResult) {
    const [isSubmitDisabled, setSubmitDisabled] = useState(false);

    const [isCreateContextModalOpen, setCreateContextModalIsOpen] = useState(false);

    const openCreateContextModal = useCallback(() => setCreateContextModalIsOpen(true), []);

    const closeCreateContextModal = useCallback(() => {
        setCreateContextModalIsOpen(false);
        setUpdateTable((state) => {
            return state + 1;
        });
    }, []);

    return [
        <ModalTransition>
            {isCreateContextModalOpen && (
                <Modal
                    height={800}
                    onClose={() => {
                        setSubmitDisabled(false);
                        closeCreateContextModal();
                    }}
                >
                    <ModalHeader>
                        <ModalTitle>Select project and issue type</ModalTitle>

                        <p>
                            For UI modification {currentUiModification?.name} (
                            {currentUiModification?.id})
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        <Form
                            onSubmit={(data) => {
                                setSubmitDisabled(true);
                                createUimContext(
                                    currentUiModification,
                                    data,
                                    setContextResult,
                                ).then(() => {
                                    setSubmitDisabled(false);
                                    closeCreateContextModal();
                                });
                            }}
                        >
                            {({ formProps }) => (
                                <form {...formProps}>
                                    <ContextSelector
                                        setSubmitDisabled={setSubmitDisabled}
                                    />

                                    <FormFooter>
                                        <Button
                                            isDisabled={isSubmitDisabled}
                                            type="submit"
                                            appearance="primary"
                                        >
                                            Submit
                                        </Button>
                                    </FormFooter>
                                </form>
                            )}
                        </Form>
                    </ModalBody>
                </Modal>
            )}
        </ModalTransition>,
        openCreateContextModal,
    ];
}
