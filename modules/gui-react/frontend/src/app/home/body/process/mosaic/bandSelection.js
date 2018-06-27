import {RecipeActions, RecipeState} from 'app/home/body/process/mosaic/mosaicRecipe'
import _ from 'lodash'
import React from 'react'
import {msg} from 'translate'
import ComboBox from 'widget/comboBox'
import {Constraints, form} from 'widget/form'
import styles from './bandSelection.module.css'

const inputs = {
    bands: new Constraints()
}

const mapStateToProps = (state, ownProps) => {
    const recipe = RecipeState(ownProps.recipeId)
    return {
        initialized: recipe('ui.initialized'),
        source: Object.keys(recipe('sources'))[0],
        values: {bands: recipe('ui.bands')}
    }
}

class BandSelection extends React.Component {
    state = {}
    options = [
        {
            label: msg('process.mosaic.bands.combinations'),
            options: [
                {value: 'red, green, blue', label: 'RED, GREEN, BLUE'},
                {value: 'nir, red, green', label: 'NIR, RED, GREEN'},
                {value: 'nir, swir1, red', label: 'NIR, SWIR1, RED'},
                {value: 'swir2, nir, red', label: 'SWIR2, NIR, RED'},
                {value: 'swir2, swir1, red', label: 'SWIR2, SWIR1, RED'},
                {value: 'swir2, nir, green', label: 'SWIR2, NIR, GREEN'},
            ]
        },
        {
            label: msg('process.mosaic.bands.metadata'),
            options: [
                {value: 'unixTimeDays', label: 'Date'},
                {value: 'dayOfYear', label: 'Day of year'},
                {value: 'daysFromTarget', label: 'Days from target'}
            ]
        }
    ]
    optionByValue = {}

    constructor(props) {
        super(props)
        this.recipe = new RecipeActions(props.recipeId)
        this.options.forEach(option => {
            if (option.options)
                option.options.forEach(option => this.optionByValue[option.value] = option)
            else
                this.optionByValue[option.value] = option
        })
    }

    render() {
        const {initialized, inputs: {bands}} = this.props
        if (initialized)
            return (
                <div className={styles.container}>
                    <div className={styles.selection}>
                        {this.state.showSelector
                            ? <BandSelector
                                recipe={this.recipe}
                                bands={bands}
                                options={this.options}
                                onChange={() => this.setSelectorShown(false)}/>
                            : <SelectedBands
                                selectedOption={this.optionByValue[bands.value]}
                                onClick={() => this.setSelectorShown(true)}/>
                        }
                    </div>
                </div>
            )
        else
            return null
    }

    setSelectorShown(shown) {
        this.setState(prevState =>
            ({...prevState, showSelector: shown})
        )
    }
}

const BandSelector = ({recipe, bands, options, onChange}) =>
    <ComboBox
        input={bands}
        placeholder={msg('process.mosaic.bands.placeholder')}
        options={options}
        autoFocus={true}
        openMenuOnFocus={true}
        menuPlacement='top'
        maxMenuHeight='40rem'
        isClearable={false}
        showChevron={false}
        className={styles.selector}
        onMenuClose={onChange}
        onChange={(option) => {
            recipe.setBands(option ? option.value : null).dispatch()
            onChange()
        }}>
        {() => <div/>}
    </ComboBox>

const SelectedBands = ({selectedOption, onClick}) => {
    const bands = selectedOption.label
    if (!bands)
        return null
    console.log({bands})
    const bandList = bands.split(', ')
    const bandClasses = bandList.length === 1
        ? ['single']
        : ['red', 'green', 'blue']

    const bandElements = _.zip(bandList, bandClasses).map(([band, className]) =>
        <div key={className} className={styles[className]} onClick={onClick}>
            {band}
        </div>
    )
    return (
        <div className={styles.selectedBands}>
            {bandElements}
        </div>
    )

}

export default form(inputs, mapStateToProps)(BandSelection)