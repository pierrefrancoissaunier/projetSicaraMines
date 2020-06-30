import CLASSES from '../../mobilenet/class_names'
const modeleLocalLabels = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']



const labelsArrayini = Object.values(CLASSES).concat(modeleLocalLabels) ;
const initialState = {labelsArray: labelsArrayini}

function addLabel(state = initialState, action) {
    let nextState
    switch(action.type){
        case 'ADD_LABEL':
            const labelIndex = state.labelsArray.findIndex(item => item == action.label)
            if (labelIndex !== -1){
                console.log('label déjà présent')
            }
            else {
                nextState = {
                    ...state,
                    labelsArray: [ ...state.labelsArray, action.label]
                }
            }
            return nextState || state
        default:
            return state
    }
}

export default addLabel